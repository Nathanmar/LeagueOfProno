/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cron from "../cron.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as httpMatches from "../httpMatches.js";
import type * as matches_simulateTick from "../matches/simulateTick.js";
import type * as matches_simulateTickAction from "../matches/simulateTickAction.js";
import type * as matches from "../matches.js";
import type * as migrations_importData from "../migrations/importData.js";
import type * as predictions from "../predictions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  cron: typeof cron;
  groups: typeof groups;
  http: typeof http;
  httpMatches: typeof httpMatches;
  "matches/simulateTick": typeof matches_simulateTick;
  "matches/simulateTickAction": typeof matches_simulateTickAction;
  matches: typeof matches;
  "migrations/importData": typeof migrations_importData;
  predictions: typeof predictions;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
