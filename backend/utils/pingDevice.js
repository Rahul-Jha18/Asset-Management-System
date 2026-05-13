const ping = require("ping");

async function pingDevice(ip) {
  if (!ip) {
    return { success: false, message: "No IP provided" };
  }

  try {
    const res = await ping.promise.probe(ip, {
      timeout: 3,
      extra: ["-c", "2"], // 2 packets
    });

    return {
      success: res.alive,
      ip,
      time: res.time,
      output: res.output,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = pingDevice;
