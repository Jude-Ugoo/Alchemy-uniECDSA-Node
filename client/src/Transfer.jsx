import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import secp from "ethereum-cryptography/secp256k1";
import { useState } from "react";
import server from "./server";
import { v4 as uuidv4 } from 'uuid';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const encoder = new TextEncoder()

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const uuid = uuidv4()
      const message = {
        amount: parseInt(sendAmount),
        uuid,
        recipient
      }

      const messageHash = encoder.encode(JSON.stringify(message))
      const [signature, bit] = await secp.sign(messageHash, privateKey, {recovered: true})
    

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: toHex(signature),
        bit,
        uuid
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
