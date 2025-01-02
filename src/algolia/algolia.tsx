import algoliasearch from 'algoliasearch/lite';

const devValues = {
  //@ts-expect-error: env might give error
  appId: import.meta.env.VITE_ALGOLIA_SEARCH_APP_ID,
  //@ts-expect-error: env might give error
  appKey: import.meta.env.VITE_ALGOLIA_SEARCH_APP_KEY,
  //@ts-expect-error: env might give error
  index: import.meta.env.VITE_ALGOLIA_SEARCH_INDEX,
};
const client = algoliasearch(devValues?.appId, devValues?.appKey, {
  timeouts: {
    connect: 10,
    read: 10,
    write: 50,
  },
});
const algoliasearch_index = client.initIndex(devValues?.index);

export default algoliasearch_index;
