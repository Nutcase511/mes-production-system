// @ts-nocheck - Required: @airiot/client's type declarations do not include the minified
// export names (createAPI, setConfig, modelRegistry, useUser, Model). These exist at
// runtime in the bundle but not in the published .d.ts files, so named imports fail tsc.

// Re-export everything from the real package (rollup/vite handles minified names)
export * from '@airiot/client'

// Add stub implementations for any missing exports
import { createAPI as _createAPI, setConfig as _setConfig, modelRegistry as _modelRegistry, useUser as _useUser, Model as _Model } from '@airiot/client'

export const createAPI = _createAPI
export const setConfig = _setConfig
export const modelRegistry = _modelRegistry
export const useUser = _useUser
export const Model = _Model
