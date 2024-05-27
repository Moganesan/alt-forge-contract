const extractRevertMessage = (err: any) => {
  const message = String(JSON.parse(JSON.stringify(err)).details || "");
  const revertReasonPattern = /reverted with reason string '([^']+)'/;
  try {
    const messageMatch: any = message.match(revertReasonPattern);
    return messageMatch[1];
  } catch (err) {
    console.log(err);
  }
};

export { extractRevertMessage };
