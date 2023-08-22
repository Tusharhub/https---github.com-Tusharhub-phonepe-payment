const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

// PhonePe API credentials
const MERCHANT_KEY = "82aeb5a9-d02e-4398-8dc9-ede90e40eb2d";

// Form page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Handle form submission
app.post("/initiate-payment", async (req, res) => {
  const amount = req.body.amountEnterByUsers;

  const data = {
    merchantId: "M1KDULVI2IHU",
    merchantTransactionId: "MT" + Date.now(),
    merchantUserId: "MIT1",
    amount: amount * 100,
    redirectUrl: "http://localhost:3000/payment-status",
    redirectMode: "POST",
    callbackUrl: "http://localhost:3000/payment-status",
    mobileNumber: "9718903887",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payloadMain = Buffer.from(JSON.stringify(data)).toString("base64");
  const payload = `${payloadMain}/pg/v1/pay${MERCHANT_KEY}`;
  const checksum = crypto.createHash("sha256").update(payload).digest("hex");
  const finalChecksum = `${checksum}###2`;

  try {
    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      { request: payloadMain },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": finalChecksum,
          accept: "application/json",
        },
      }
    );

    const url = response.data.data.instrumentResponse.redirectInfo.url;
    res.redirect(url);
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).send("Error initiating payment");
  }
});

// Payment status route
// Payment status route
// Payment status route
app.get("/payment-status", (req, res) => {
  // Retrieve query parameters from the URL
  const code = req.query.code;
  const transactionId = req.query.transactionId;
  const providerReferenceId = req.query.providerReferenceId;

  // Redirect to payment.html with query parameters
  res.sendFile(__dirname + "/public/payment.html");
  res.sendFile(path.join(__dirname, "public", "payment.html"));
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
