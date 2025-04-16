declare global {
  interface Window {
    __NUBE_DEVTOOLS_EXTENSION__: boolean
    nubeSDK: any
  }
}

export {}
