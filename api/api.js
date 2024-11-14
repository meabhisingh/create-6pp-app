import axios from "axios";

const expireTime = 60 * 60 * 24;

const getLatestVersion = async (packageName, redis) => {
  try {
    const cacheKey = `latestVersion-${packageName}`;
    let version = await redis.get(cacheKey);

    if (version) return JSON.parse(version);

    if (packageName === "@types/express")
      version = { name: "@types/express", version: "4.17.21" };
    else {
      const { data } = await axios.get(
        `https://registry.npmjs.org/${packageName}`
      );
      version = { name: packageName, version: data["dist-tags"].latest };
    }

    redis.setex(cacheKey, expireTime, JSON.stringify(version));
    return version;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getLatestVersion };
