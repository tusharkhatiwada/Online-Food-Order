import { ToastAndroid } from "react-native";
import BluetoothSerial from "react-native-bluetooth-serial";
import { Sentry } from "react-native-sentry";
import { table, getBorderCharacters } from "table";
import { EscPos } from "escpos-xml";
import axios from "axios";
import CryptoJS from "crypto-js";
import Base64 from "Base64";
import values from "lodash/values";

export const fetchOrderDetails = async id => {
  const token = await AsyncStorage.getItem("@ccs_token");
  let encode = Base64.btoa(`WEB;${Math.floor(Date.now() / 1000)};GET;/Orders/${id}`);
  let digest = CryptoJS.HmacSHA256(encode, "d80b301b98c1f309351e36a9").toString();
  console.log("Now Order: ", id);
  axios({
    method: "get",
    url: `/Orders/${id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer WEB_${token};${Math.floor(Date.now() / 1000)};${digest}`
    },
    data: {}
  })
    .then(response => {
      if (response.status == 200) {
        const res = response.data;
        printReceipt(res[0]);
      }
    })
    .catch(err => {
      console.log("Error getting Orders: ", err);
    });
};

const generateItemRow = item => {
  return `${item.cost.item.item}\n${cartInfo(item.cart)}\n${item.cost.item.note.length > 0 &&
    `\nCUSTOMER NOTE\n ${item.cost.item.note}`}`;
};

const cartInfo = cart => {
  return values(cart.prices)
    .map(cp => {
      return `\n${cp.info.name.length > 0 ? `**${cp.info.name}**\n` : ``}\n${
        cp.modules.length !== 0 ? toppingsInfo(cp.modules) : "*"
      }`;
    })
    .join("\n");
};

const toppingsInfo = toppings => {
  if (toppings.length != 0) {
    const toppingsArray = Object.values(toppings);
    return toppingsArray
      .map(top => {
        return `${top.name}\n${
          top.chosen
            ? values(top.chosen)
                .map(chosen => {
                  return ` ${chosen.name}`;
                })
                .join("\n")
            : values(top.toppings)
                .map(t => {
                  return ` ${t.topping} (${t.chosen.placement})`;
                })
                .join("\n")
        }`;
      })
      .join("\n");
  }
};
const printReceipt = async details => {
  const items = values(details.data);
  let itemsTable = [];

  await items.map(async item => {
    await itemsTable.push([
      item.cost.quantity,
      generateItemRow(item),
      `${Math.round(parseFloat(item.cost.cost.final) * parseFloat(item.cost.quantity) * 100) / 100}`
    ]);
  });

  let data = [["QTY", "ITEM", "COST"], ...itemsTable];

  const config = {
    columns: {
      0: {},
      1: {
        width: 31
      },
      2: {
        alignment: "right"
      }
    },
    border: getBorderCharacters(`void`),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 1
    },
    drawHorizontalLine: () => {
      return false;
    }
  };
  const priceConfig = {
    columns: {
      0: {
        width: 32
      },
      1: {
        alignment: "right",
        width: 12
      }
    },
    border: getBorderCharacters(`void`),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 1
    },
    drawHorizontalLine: () => {
      return false;
    }
  };
  debugger;
  console.log("Table Data: ", data);
  let output = await table(data, config);
  let pricesTable = [
    ["SUBTOTAL", details.payment.totals.subtotal],
    ["TAX", details.payment.totals.tax],
    ["TOTAL", details.payment.totals.final]
  ];
  if (details.payment.totals.discount != "0.00") {
    pricesTable.splice(1, 0, ["DISCOUNT", details.payment.totals.discount]);
  }
  if (details.payment.totals.tip != "0.00") {
    pricesTable.splice(pricesTable.length - 1, 0, ["TIPS", details.payment.totals.tip]);
  }
  if (details.payment.totals.fee.usage != "0.00") {
    pricesTable.splice(pricesTable.length - 1, 0, [
      "CONVENIENCE FEE",
      details.payment.totals.fee.usage
    ]);
  }
  let pricesOutput = await table(pricesTable, priceConfig);
  const xml = `
  <?xml version="1.0" encoding="UTF-8"?>
  <document>
    <line-feed />
    <align mode="center">
        <bold>
          <text-line size="1:0">{{header}}</text-line>
        </bold>
        <line-feed />
        <text-line size="0:0">{{add1}}</text-line>
        <text-line size="0:0">{{add2}}</text-line>
        <text-line size="0:0">{{add3}}</text-line>
        <text-line size="0:0">{{tel1}}</text-line>
    </align>
    <line-feed />
    <bold>
        <text-line size="1:0">CUSTOMER</text-line>
    </bold>
    <break-line lines="2" />
    <text-line size="0:0">{{customer}}</text-line>
    {{#if showDelivery}}
    <text-line size="0:0">{{custAdd1}}</text-line>
    <text-line size="0:0">{{custAdd2}}</text-line>
    {{/if}}
    <text-line size="0:0">{{tel2}}</text-line>
    <line-feed />
    <bold>
        <text-line size="1:0">Payment Method</text-line>
    </bold>
    <break-line lines="2" />
    <text-line size="0:0">{{paymentMethod}}</text-line>
    <line-feed />
    <bold>
        <text-line size="1:0">Order Date</text-line>
    </bold>
    <break-line lines="2" />
    <text-line size="0:0">{{orderDate}}</text-line>
    {{#if isFutureDate}}
    <line-feed />
    <bold>
        <text-line size="1:0">Future Order</text-line>
    </bold>
    <break-line lines="2" />
    <text-line size="0:0">{{futureDate}}</text-line>
    {{/if}}
    <line-feed />
    <align mode="left">
      <text-line size="0:0">{{table}}</text-line>
    </align>
    <line-feed />
    <text-line size="0:0">{{pricesOutput}}</text-line>
    <line-feed />
    <text-line size="0:0">ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghizklmnopqrstuvwxyz</text-line>
  </document>
  `;
  const detailsData = {
    header: `${details.type === "pickup" ? "TAKE-OUT" : "DELIVERY"} #${details.order_id}`,
    add1: details.location.address || "",
    add2: details.location.city || "",
    add3: `${details.location.state} ${details.location.zip}` || "",
    tel1: details.location.telephone || "",
    customer: `${details.customer.first} ${details.customer.last}` || "",
    tel2: details.customer.telephone || "",
    custAdd1:
      `${details.customer.address ? details.customer.address.street_number : ""} ${
        details.customer.address ? details.customer.address.street : ""
      }` || "",
    custAdd2:
      `${details.customer.address ? details.customer.address.city : ""}, ${
        details.customer.address ? details.customer.address.state : ""
      } ${details.customer.address ? details.customer.address.zipcode : ""}` || "",
    subtotal: details.payment.totals.subtotal || "",
    tax: details.payment.totals.tax || "",
    total: details.payment.totals.final || "",
    table: output,
    pricesOutput: pricesOutput,
    orderDate: details.local_date || "",
    futureDate: details.payment.order_when.date || "",
    isFutureDate: details.payment.order_when.date ? true : false,
    paymentMethod: `${
      details.payment.method === "cod"
        ? `Pay on Delivery (${details.payment.details})`
        : "Pay in Person"
    }`,
    showDelivery: details.payment.method === "cod" ? true : false
  };

  const buffer = await EscPos.getBufferFromTemplate(xml, detailsData);

  const printed = await BluetoothSerial.write(buffer);
  // console.log("Printed: ", detailsData);
  printed
    .then(res => {
      console.log("Print: ", res);
      ToastAndroid.showWithGravity(
        "Print successful",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    })
    .catch(err => {
      console.log("Error printing: ", err);
      Sentry.captureException(err);
    });
};

export default printReceipt;
