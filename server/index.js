const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");

const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");

const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "43f62096330aed9d6490a02dd2397f501a6da73e": 100, // Ugoo's
  "3d19147a605fce4aeb882a750b707281bf469e99": 50, // Ike's
  "15119772f1733986a1c757079f0e7a1ad5af644f": 75, // Chima
};

const handledSignatures = new Set();

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: GET A SIGNATURE FROM CLIENT SIDE APPLICATION------------------------------
  // TODO: RECOVER PUBLIC ADDRESS FROM THE SIGNATURE----------------------------------

  const { sender, recipient, amount, signature, uuid, bit } = req.body;

  if (handledSignatures.has(signature)) {
    console.log("Signature was already handled");
    return res.status(400).send({ message: "Invalid signature" });
  }
  handledSignatures.add(signature);

  // REBUILD THE SIGNATURE
  const message = {
    amount,
    uuid,
    recipient,
  };

  const messageHash = Buffer.from(JSON.stringify(message));
  const recoveredPublicKey = secp.recoverPublicKey(messageHash, signature, bit);

  if (`0x${toHex(recoveredPublicKey.slice(-20))}` !== sender) {
    return res.status(400).send({ message: "Invalid sender" });
  }

  const isSigned = secp.verify(signature, messageHash, recoveredPublicKey);

  if (!isSigned) {
    return res.status(400).send({ message: "Invalid signature" });
  }

 // TODO END------------------------------------------------------------------------

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
