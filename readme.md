# Token Provider

This library helps developers adhere to rate limits imposed by third-party providers across multiple running processes at once.

## Example

The Gitlab API has strict rate limits of:

```
10 requests / second
600 requests / minute
```

Let's say your users supply your backend with their personal Gitlab token to make API calls on their behalf. Let's also say you have more than one backend server that can use the token at any given time (dosesn't have to be literal servers, it could also just be multiple running Pods in a Kubernetes cluster).

You (as the developer) want to adhere to the rate limits imposed by Gitlab. But you also want to let the work be managed by any (often simultaneous) backend instances.

How do you sync the usage of the users personal token across all of your backend instances?

This library gives developers a `TokenProvider` instance that returns a new `Token` object for a given api key. The usage of this `Token` is synced across all of your instances. It uses a `Promise` when you want to use the token to release it when it can be used.

Let's look at a code example:

```
import { TokenProvider, Token, RedisStorageProvider } from 'token-provider'

async function main() {
    // Create the token provider
    const tokenProvider = new TokenProvider({
        name: "Gitlab Token Provider",
        quotas: [
            {
                numberOfRequests: 10,
                duration: "1s",
            },
            {
                numberOfRequests: 600,
                duration: "1m",
            },
        ],
        storage: new RedisStorageProvider({}),
    })

    // Fetch the users token
    const token: Token = tokenProvider.getToken('<API TOKEN HERE>')

    // Use the token a bunch
    for (let i = 0; i < 1000; i++) {
        const startTime = new Date().getTime()

        const res = await axios({
            method: 'GET',
            url: 'https://gitlab.com/api/v4/user',
            headers: {
                'PRIVATE-TOKEN': await token.use()
            }
        })

        console.log(`${new Date().getTime() - startTime}ms`)
    }
}

main().then(() => console.log('finished'))
```

The `TokenProvider` takes configuration data about the rate limits it needs to restrict usage by, a friendly name, and the backend storage provider to use (Redis in this case).

We use `TokenProvider.getToken(tokenKey: string)` to fetch the corresponding `Token` object.

When we want to use the token, we call `token.use()`. This returns a `Promise` that only resolves when the `Token` can be used again. It also adds to the usage counter. This usage state is synced across all instances that are connected to the same `TokenStorageProvider` (Redis in this case.).

## Documentation

### TokenProvider

This is the root instance of the library. Use it to get the corresponding `Token` instance for each key you are using.

#### Constructor

Below is the configuration for a new `TokenProvider`. It uses [parse-duration](https://www.npmjs.com/package/parse-duration) for duration fields.

```
new TokenProvider({
    name: 'Name Here', // Just a friendly name of the provider. REQUIRED.
    quotas: [ // A list of the rate limit quotas we need to adhere by. REQUIRED
        {
            numberOfRequests: 0, // Number, how many requests can be made?
            duration: '1m' // String, what is the duration? Uses parse-duration syntax. e.g. 1m = 1 minute, 1h = 1h, 30s = 30 seconds...
        }
    ],
    storage: new MemoryStorageProvider() // Instantiated storage provider. Currently only RedisStorageProvider and MemoryStorageProvider are allowed.
})
```

#### getToken

`.getToken(tokenKey: string)` -> Only requires a string, returns the `Token` object.

```
const token: Token = tokenProvider.getToken('<API KEY HERE>');
```

### Token

This represents a users token.

### use

`token.use()` -> Returns a `Promise` that resolves when the token can be used. It can be used in two different ways:

Option 1, `async`:

```
const res = await axios({
    method: 'GET',
    url: '... some url',
    headers: {
        'PRIVATE-TOKEN': await token.use()
    }
})
```

Option 2, `callback`:

```
token.use(async (tokenKey: string) => {
    const res = await axios({
        method: 'GET',
        url: '... some url',
        headers: {
            'PRIVATE-TOKEN': tokenKey
        }
    })
})
```

## Storage Providers

Storage Providers are the backing storage for the usage state. Currently there are two flavors, and only one that syncs across multiple instances.

### RedisStorageProvider

This Storage Provider uses Redis as the backing data state.

#### Constructor

This uses the [redis](https://www.npmjs.com/package/redis) package as the Redis client. The input configuration matches this clients ClientOpts exactly.

```
const redisStorageProvider = new RedisStorageProvider({
    ... redis ClientOpts
})
```

It uses a hashing algorithm to hash the `TokenProvider.name`, `Quota.uid` (generated), and the `Token.key` for storage. While the token value is hashed, I wouldn't call it _encrypted_. Please keep your Redis instance secured.

### MemoryStorageProvider

This just uses in-memory variables to handle the usage state. This is fine for a single application but it will not scale to multiple instances.

#### Constructor

No options.

```
const memoryStorageProvider = new MemoryStorageProvider()
```
