// --- Definições de Tipo (Equivalentes ao Fetch) ---

export type XHRAuditMessage =
    | {
            type: "xhr:start";
            app: string;
            method: string;
            url: string;
            requestId: string;
      }
    | {
            type: "xhr:end";
            app: string;
            method: string;
            url: string;
            duration: number;
            success: true;
            status: number;
            requestId: string;
      }
    | {
            type: "xhr:fail";
            app: string;
            method: string;
            url: string;
            duration: number;
            success: false;
            error: unknown;
            requestId: string;
      };

// --- Implementação do Wrapper ---

{
    const OriginalXHR = window.XMLHttpRequest;

    class XHRWrapper extends OriginalXHR {
        // Propriedades internas para manter o estado da requisição
        private _method = "GET";
        private _url = "";
        private _requestId = "";
        private _spanId = "";
        private _startPerformanceTime = 0;
        private _startTimeUnixNano = 0;

        // 1. OPEN: Configuração inicial (equivalente ao início da função fetch)
        open(method: string, url: string | URL, ...args: unknown[]) {
            this._method = method;
            this._url = typeof url === "string" ? url : url.toString();
            
            // Gerar IDs aqui ou no send, mas open é onde definimos a intenção
            this._requestId = crypto.randomUUID();
            this._spanId = crypto.randomUUID(); 

            // @ts-ignore - Chamada original
            return super.open(method, url, ...args);
        }

        // 2. SEND: Disparo e Logging (equivalente ao try { ... })
        send(body?: Document | XMLHttpRequestBodyInit | null) {
            this._startPerformanceTime = performance.now();
            this._startTimeUnixNano = Math.round(
                (performance.timeOrigin + this._startPerformanceTime) * 1_000_000,
            );

            // Log: xhr:start (Mostrado no devtools)
            const startMessage: XHRAuditMessage = {
                type: "xhr:start",
                app: "unknown",
                method: this._method,
                url: this._url,
                requestId: this._requestId,
            };
            // Se você tiver um handler global para exibir isso, chame aqui.
            // console.log(startMessage); 

            // Adicionamos os listeners antes de enviar
            this.addEventListener("load", this._handleLoad);
            this.addEventListener("error", this._handleError);
            this.addEventListener("timeout", this._handleError); // Timeout conta como falha de rede
            this.addEventListener("abort", this._handleError);   // Abort conta como falha

            return super.send(body);
        }

        // 3. HANDLER SUCESSO HTTP (Equivalente ao sucesso do await fetch)
        // Isso roda mesmo se for 404 ou 500, desde que o servidor tenha respondido.
        private _handleLoad = () => {
            const duration = performance.now() - this._startPerformanceTime;

            // Log: xhr:end
            const endMessage: XHRAuditMessage = {
                type: "xhr:end",
                app: "unknown",
                method: this._method,
                url: this._url,
                duration,
                success: true,
                status: this.status,
                requestId: this._requestId,
            };
            // console.log(endMessage);

            // Telemetria
            console.log({
              app: "unknown",
              type: "telemetry:traces",
              data: {
                  appId: "unknown",
                  scriptUrl: "unknown",
                  storeId: 0, // setup store id
                  storeName: "unknown", // setup store name
                  storeDomain: "unknown", // setup store domain
                  source: "http-xhr",
                  startTime: this._startTimeUnixNano,
                  spanId: this._spanId,
                  method: this._method,
                  url: this._url,
                  duration,
                  success: true,
                  status: this.status,
                  requestId: this._requestId,
              },
          });
        }

        // 4. HANDLER ERRO DE REDE (Equivalente ao catch(error))
        // CORS, Rede offline, DNS falhou, etc.
        private _handleError = (event: ProgressEvent) => {
            const duration = performance.now() - this._startPerformanceTime;
            
            // Tentamos determinar o tipo de erro baseados no evento
            const errorType = event.type; // "error", "timeout", "abort"

            // Log: xhr:fail
            const failMessage: XHRAuditMessage = {
                type: "xhr:fail",
                app: "unknown",
                method: this._method,
                url: this._url,
                duration,
                success: false,
                error: errorType,
                requestId: this._requestId,
            };
            // console.error(failMessage);

            // Telemetria
            console.log({
              app: "unknown",
              type: "telemetry:traces",
              data: {
                  appId: "unknown",
                  scriptUrl: "unknown",
                  storeId: 0, // setup store id
                  storeName: "unknown", // setup store name
                  storeDomain: "unknown", // setup store domain
                  source: "http-xhr",
                  startTime: this._startTimeUnixNano,
                  spanId: this._spanId,
                  method: this._method,
                  url: this._url,
                  duration,
                  success: false,
                  status: 0, // XHR status é 0 em erros de rede
                  error: `XHR Error: ${errorType}`,
                  requestId: this._requestId,
              },
          });
        };
    }

    // Sobrescreve o XHR global
    window.XMLHttpRequest = XHRWrapper;
}