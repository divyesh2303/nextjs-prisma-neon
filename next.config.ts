// next.config.ts
// import path from "path";
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   webpack(config) {
//     // Limit context strictly to the project folder
//     config.context = path.resolve(__dirname);

//     // Tell webpack to ignore user/system folders
//     config.watchOptions = {
//       ignored: [
//         "**/node_modules/**",
//         "**/.git/**",
//         "**/.next/**",
//         "C:/Users/**/AppData/**",
//         "C:/Users/**/Application Data/**",
//         "C:/Users/**/Cookies/**",
//         "C:/Users/**/Local Settings/**",
//         "C:/Users/**/Recent/**",
//         "C:/Users/**/SendTo/**",
//         "C:/Users/**/Start Menu/**",
//         "C:/Users/**/Templates/**",
//       ],
//     };

//     return config;
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
