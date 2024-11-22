import Helper from "./Helper";

export async function getOrderBookingHash() {
  var month = ("0" + (new Date().getMonth() + 1)).slice(-2);

  const unique = new Date().valueOf();

  let generateCode = await Helper.generatePassword(4, {
    digits: true,
    lowercase: false,
    uppercase: false,
  });

  let randomId: string =
    generateCode + String(unique).substring(10, 12) + month;

  return randomId;
}
