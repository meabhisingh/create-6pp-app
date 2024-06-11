import axios from "axios";

const getLatestVersion = async (packageName, redis) => {
  try {
    // const cacheKey = `latestVersion-${packageName}`;
    // let version = await redis.get(cacheKey);

    // if (version) return JSON.parse(version);
    // else {
    const { data } = await axios.get(
      `https://registry.npmjs.org/${packageName}`
    );

    const version = {
      name: packageName,
      version: data["dist-tags"].latest,
    };
    // redis.setex(cacheKey, 60 * 60 * 24, JSON.stringify(version));
    return version;
    // }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getLatestVersion };
