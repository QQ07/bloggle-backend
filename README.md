Live at [Cloudflare worker](https://api.bloggle.rohanvaidya.tech/)
<!--  [and here also](https://backend.rohanv-rvaidya.workers.dev/) -->

# To Get Started
```
npm i
npm run dev
```

# To deploy on cloudflare Worker
```
npm run deploy
```

The backend uses Zod for validation, which is indirectly imported using the custom npm package hosted on [npm](https://www.npmjs.com/package/@qq07/bloggle-common)

So that the inferred types can also be used by the frontend.