# Estado de la Aplicación

El tipo `NubeSDKState` representa el estado completo de una app creada con el NubeSDK, proporcionando acceso a todos los datos y configuraciones disponibles. Este objeto de estado se pasa a varias funciones del SDK, permitiendo que los desarrolladores accedan y reaccionen al estado actual de la aplicación.

La definición del tipo se puede encontrar en el paquete `@tiendanube/nube-sdk-types`.

```typescript
import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
```

## Cómo obtener el estado

Existen 3 formas de obtener el `NubeSDKState` en tu aplicación:

### 1. Función getState

Esta función devuelve el estado actual del SDK, ideal para obtener información al inicio de la aplicación.

```typescript
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // Obtener el estado actual
  const currentState: Readonly<NubeSDKState> = nube.getState();

  // Acceder a propiedades del estado
  const cartTotal = currentState.cart.total;
  const storeCurrency = currentState.store.currency;
  const currentPage = currentState.location.page.type;
}
```

### 2. Escuchando Cambios de Estado

Cada vez que se dispara un evento, la función de escucha recibe una instantánea del estado en el momento del evento.

```typescript
import type { NubeSDK, NubeSDKState } from '@tiendanube/nube-sdk-types';

export function App(nube: NubeSDK) {
  // Escuchar cambios de estado
  nube.on('customer:update', (state: Readonly<NubeSDKState>) => {
      const customerEmail = state.customer.email;
      const customerAddress = state.customer.address;
    }
  });
}
```

Para más detalles sobre cómo monitorear actualizaciones de estado y suscribirse a varios eventos de estado, consulta [Eventos](./events). Esta página proporciona ejemplos y explicaciones completos sobre cómo escuchar actualizaciones como `cart:update`, `shipping:update` y más, permitiéndote construir una aplicación dinámica y receptiva.

### 3. Modificando el Estado

Cuando se envía un evento, se puede definir una función modificadora como segundo parámetro. Esta función recibe una instantánea del estado y debe devolver una versión parcial del estado para ser fusionada con el estado actual.

```tsx
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Enviar eventos con modificaciones de estado
  nube.send("ui:slot:set", (state: Readonly<NubeSDKState>) => {
    // Devolver un DeepPartial<NubeSDKState>
    const storeName = state.store.name;
    return {
      ui: {
        slots: {
          before_main_content: <Text>{`Hello ${storeName}!`}</Text>,
        },
      },
    };
  });
}
```

## `NubeSDKState`

A continuación encontrarás la definición completa del tipo `NubeSDKState`.

```typescript
export type NubeSDKState = {
  /**
   * El estado actual del carrito, conteniendo productos, precios y estado de validación.
   */
  cart: Cart;

  /**
   * Configuraciones de aplicación en todo el ámbito, incluyendo reglas de validación del carrito.
   */
  config: AppConfig;

  /**
   * La ubicación actual del usuario dentro de la aplicación, incluyendo el tipo de página y URL.
   */
  location: AppLocation;

  /**
   * Información sobre la tienda actual, como dominio, moneda e idioma.
   */
  store: Store;

  /**
   * Representa el estado relacionado con la UI, incluyendo componentes inyectados dinámicamente y sus valores.
   */
  ui: UI;

  /**
   * Información sobre envío, como opciones disponibles, opción seleccionada y etiquetas personalizadas.
   * Esta propiedad puede ser nula dependiendo de la página desde la que se accede.
   */
  shipping: Nullable<Shipping>;

  /**
   * Detalles sobre el cliente, incluyendo identificación, información de contacto y dirección.
   */
  customer: Nullable<Customer>;

  /**
   * Información sobre el método de pago, incluyendo tipo, estado y opción seleccionada.
   */
  payment: Nullable<Payment>;
};
```

## `cart`

El estado actual del carrito, conteniendo productos, precios y estado de validación.

```typescript
type Cart = {
  /** Identificador único para la sesión del carrito. */
  id: string;

  /** Estado de validación del carrito. */
  validation: CartValidation;

  /** Lista de productos actualmente en el carrito. */
  items: Product[];

  /** Desglose de los detalles de precios del carrito. */
  prices: Prices;

  /** Cupón opcional aplicado al carrito. */
  coupon: Nullable<Coupon>;
};

type Product = {
  /** Identificador único para la instancia del producto en el carrito. */
  id: number;

  /** Nombre del producto. */
  name: string;

  /** Precio del producto en formato de cadena (para coincidir con la respuesta de la API). */
  price: string;

  /** Cantidad de este producto en el carrito. */
  quantity: number;

  /** Indica si el producto califica para envío gratuito. */
  free_shipping: boolean;

  /** Identificador único para el producto (no específico del carrito). */
  product_id: number;

  /** Identificador único para la variante del producto seleccionada. */
  variant_id: number;

  /** URL de la imagen en miniatura del producto. */
  thumbnail: string;

  /** Detalles de la variante, generalmente una combinación de atributos seleccionados. */
  variant_values: string;

  /** SKU (Unidad de Mantenimiento de Stock) nulo para la variante del producto. */
  sku: Nullable<string>;

  /** Propiedades adicionales relacionadas con el producto (estructura desconocida). */
  properties: Array<unknown>;

  /** URL de la página del producto. */
  url: string;

  /** Indica si el producto es elegible para financiamiento Ahora 12. */
  is_ahora_12_eligible: boolean;
};

type Prices = {
  /** Descuento aplicado a través de un cupón. */
  discount_coupon: number;

  /** Descuento aplicado a través de una pasarela de pago. */
  discount_gateway: number;

  /** Descuento aplicado a través de una promoción de la tienda. */
  discount_promotion: number;

  /** Costo del envío. */
  shipping: number;

  /** Subtotal antes de descuentos y envío. */
  subtotal: number;

  /** Precio total final después de todos los descuentos y envío. */
  total: number;
};

type Coupon = {
  /** El código del cupón utilizado. */
  code: string;

  /** El tipo de descuento (porcentaje, fijo, etc.). */
  type: string;

  /** El valor del descuento (formato depende del `type`). */
  value: string;
};

/** El estado de validación del carrito */
type CartValidation =
  | CartValidationSuccess
  | CartValidationPending
  | CartValidationFail;

type CartValidationSuccess = { status: "success" };
type CartValidationPending = { status: "pending" };
type CartValidationFail = { status: "fail"; reason: string };
```

## `config`

Configuraciones de aplicación en todo el ámbito, incluyendo reglas de validación del carrito.

```typescript
type AppConfig = {
  /** Determina si la validación del carrito está habilitada. */
  has_cart_validation: boolean;

  /** Determina si el usuario puede seleccionar una opción de envío. */
  disable_shipping_more_options: boolean;
};
```

## `location`

La ubicación actual del usuario dentro de la aplicación, incluyendo el tipo de página y URL.

```typescript
type AppLocation = {
  /** La URL actual de la aplicación. */
  url: string;

  /** El tipo de página actual y sus datos asociados. */
  page: Page;

  /**
   * Parámetros de consulta extraídos de la URL.
   *
   * Cada clave representa el nombre de un parámetro de consulta, y su valor
   * correspondiente representa el valor de ese parámetro de consulta.
   */
  queries: Record<string, string>;
};

// Nuevas variaciones se romperán con la evolución del NubeSDK
type Page = CheckoutPage;

type CheckoutPage = {
  type: "checkout";
  data: Checkout;
};

type Checkout = {
  step: "start" | "payment" | "success";
};

type Category = {
  id: string;
  name: string;
};
```

## `store`

Información sobre la tienda actual, como dominio, moneda e idioma.

```typescript
type Store = {
  domain: string;
  currency: string;
  language: string;
  settings: StoreSettings;
};
```

## `ui`

Representa el estado relacionado con la UI, incluyendo componentes inyectados dinámicamente y sus valores.

```typescript
type UI = {
  /**
   * Contiene componentes inyectados dinámicamente en slots específicos de la UI.
   * Cada clave representa un nombre de slot y su valor es el componente a renderizar.
   */
  slots: UISlots;

  /**
   * Almacena valores asociados con componentes específicos de la UI, típicamente entradas de formulario.
   * ADVERTENCIA: Estos valores son gestionados internamente por los componentes del SDK.
   * Modificarlos directamente puede causar comportamiento inesperado.
   */
  values: UIValues;
};

/**
 * Representa un mapeo de slots de UI a sus respectivos componentes.
 */
type UISlots = Partial<Record<UISlot, NubeComponent>>;

/**
 * Representa un mapeo de IDs de componentes de UI a sus respectivos valores.
 */
type UIValues = Record<NubeComponentId, UIValue>;

/**
 * Representa un slot de UI donde los componentes pueden ser inyectados dinámicamente.
 */
type UISlot =
  | "before_main_content" // Antes del contenido principal del checkout
  | "after_main_content" // Después del contenido principal del checkout
  | "before_line_items" // Antes de la lista de items en el carrito
  | "after_line_items" // Después de la lista de items en el carrito
  | "after_contact_form" // Después del formulario de contacto en el checkout
  | "after_address_form" // Después del formulario de dirección en el checkout
  | "after_billing_form" // Después del formulario de facturación en el checkout
  | "after_payment_options" // Después de las opciones de pago en el checkout
  | "before_address_form" // Antes del formulario de dirección en el checkout
  | "before_billing_form" // Antes del formulario de facturación en el checkout
  | "before_contact_form" // Antes del formulario de contacto en el checkout
  | "modal_content"; // Contenido de un diálogo modal en el checkout

/**
 * Representa el valor de un componente de UI, típicamente usado para entradas de formulario.
 */
type UIValue = string;

/**
 * Representa un identificador único para un componente de UI.
 */
type NubeComponentId = string;
```

## `shipping`

Información sobre envío, como opciones disponibles, opción seleccionada y etiquetas personalizadas.
Esta propiedad puede ser nula dependiendo de la página desde la que se accede.

```typescript
type Shipping = {
  /** ID de la opción de envío seleccionada. */
  selected: Nullable<string>;

  /** Lista de opciones de envío disponibles. */
  options: ShippingOption[];

  /** Etiquetas personalizadas asignadas a las opciones de envío. */
  custom_labels: Record<string, string>;
};

type ShippingOption = {
  /** Identificador único para la opción de envío. */
  id: string;

  /** Nombre original de la opción de envío. */
  original_name: Nullable<string>;

  /** Nombre de visualización de la opción de envío. */
  name: Nullable<string>;

  /** Código del método de envío. */
  code: Nullable<string>;

  /** Código de referencia para la opción de envío. */
  reference: Nullable<string>;

  /** Tipo de método de envío. */
  type: Nullable<string>;

  /** Precio de la opción de envío. */
  price: number;

  /** Precio del comerciante de la opción de envío. */
  price_merchant: number;

  /** Moneda del costo de envío. */
  currency: string;

  /** Fecha mínima estimada de entrega. */
  min_delivery_date: Nullable<string>;

  /** Fecha máxima estimada de entrega. */
  max_delivery_date: Nullable<string>;

  /** Indica si se requiere un número de teléfono para el envío. */
  phone_required: boolean;

  /** Indica si se requiere un ID para el envío. */
  id_required: boolean;

  /** Indica si se acepta pago contra reembolso. */
  accepts_cod: boolean;

  /** Indica elegibilidad para envío gratuito. */
  free_shipping_eligible: boolean;

  /** Detalles adicionales de envío. */
  extra: {
    show_time: boolean;
    warning: {
      enable: boolean;
    };
    assigned_location_id: Nullable<string>;
    free_shipping: Nullable<number>;
    free_shipping_min_value: Nullable<string>;
    free_shipping_price_merchant: Nullable<number>;
    free_shipping_methods: Nullable<string[]>;
    free_shipping_combines_with_other_discounts: boolean;
  };

  /** Identificador del método de envío. */
  method: Nullable<string>;

  /** ID de la aplicación asociada a la opción de envío. */
  app_id: Nullable<string>;

  /** Indica si la opción de envío está oculta. */
  hidden: boolean;

  /** Prioridad de la opción de envío. */
  priority: Nullable<number>;

  /** Indica si la opción de envío está disponible. */
  shippable: boolean;

  /** Código interno de la opción de envío. */
  shipping_internal_option_code: Nullable<string>;

  /** Clave de firma para la opción de envío. */
  sign_key: Nullable<string>;

  /** Información de fecha inteligente para estimaciones de entrega. */
  smart_date: {
    translate_old_string: Nullable<string>;
    translate_string: Nullable<string>;
    total_old_time: Nullable<string>;
    total_exact_time: Nullable<string>;
    final_time: Nullable<string>;
    show_time: boolean;
    days: Nullable<string>;
    from_week_day: Nullable<string>;
    from_date: Nullable<string>;
    to_week_day: Nullable<string>;
    to_date: Nullable<string>;
    from: Nullable<number>;
    to: Nullable<number>;
    min_days: Nullable<number>;
    max_days: Nullable<number>;
    extra_days: unknown;
  };
};
```

## `customer`

Detalles sobre el cliente, incluyendo identificación, información de contacto y dirección.
Esta propiedad puede ser nula dependiendo de la página desde la que se accede.

```typescript
type Customer = {
  /** Información de contacto del cliente. */
  contact: {
    /** Dirección de correo electrónico del cliente. */
    email: Nullable<string>;

    /** Nombre completo del cliente. */
    name: Nullable<string>;

    /** Número de teléfono del cliente. */
    phone: Nullable<string>;

    /** Si el cliente acepta comunicaciones de marketing. */
    accepts_marketing: Nullable<boolean>;

    /** Marca de tiempo de cuando las preferencias de marketing se actualizaron por última vez. */
    accepts_marketing_updated_at: Nullable<string>;
  };

  /** Dirección de envío del cliente. */
  shipping_address: ShippingAddress;

  /** Dirección de facturación del cliente. */
  billing_address: BillingAddress;
};

type Address = {
  /** Código postal de la dirección. */
  zipcode: string;

  /** Primer nombre del propietario de la dirección. */
  first_name: Nullable<string>;

  /** Apellido del propietario de la dirección. */
  last_name: Nullable<string>;

  /** Dirección de la calle. */
  address: Nullable<string>;

  /** Número de la calle. */
  number: Nullable<string>;

  /** Piso o número de apartamento. */
  floor: Nullable<string>;

  /** Localidad o barrio. */
  locality: Nullable<string>;

  /** Nombre de la ciudad. */
  city: Nullable<string>;

  /** Estado o provincia. */
  state: Nullable<string>;

  /** Nombre del país. */
  country: Nullable<string>;

  /** Número de teléfono asociado a la dirección. */
  phone: Nullable<string>;
};

type ShippingAddress = Address & {
  /** Información adicional de la dirección entre calles. */
  between_street: Nullable<string>;

  /** Puntos de referencia o información adicional de la dirección. */
  reference: Nullable<string>;
};

type BillingAddress = Address & {
  /** Número de identificación fiscal. */
  id_number: Nullable<string>;

  /** Tipo de cliente (persona física o jurídica). */
  customer_type: Nullable<string>;

  /** Nombre legal de la empresa. */
  business_name: Nullable<string>;

  /** Nombre comercial o nombre de fantasía. */
  trade_name: Nullable<string>;

  /** Número de inscripción estatal. */
  state_registration: Nullable<string>;

  /** Clasificación del régimen fiscal. */
  fiscal_regime: Nullable<string>;

  /** Clasificación de uso de la factura. */
  invoice_use: Nullable<string>;

  /** Tipo de documento de identificación. */
  document_type: Nullable<string>;

  /** Actividad o sector empresarial. */
  business_activity: Nullable<string>;
};
```

## `payment`

Información sobre el método de pago, incluyendo tipo, estado y opción seleccionada.
Esta propiedad puede ser nula dependiendo de la página desde la que se accede.

```typescript
type Payment = {
  /** El método de pago seleccionado. */
  method: string;

  /** El estado actual del pago. */
  status: PaymentStatus;

  /** Los detalles de la opción de pago seleccionada. */
  selectedOption: Nullable<PaymentOption>;
};

/** Representa los posibles estados de pago. */
type PaymentStatus =
  | "pending" // El pago está pendiente de procesamiento
  | "processing" // El pago está siendo procesado
  | "approved" // El pago fue aprobado
  | "rejected" // El pago fue rechazado
  | "failed" // El pago falló
  | "cancelled"; // El pago fue cancelado

/** Representa una opción de pago con sus detalles. */
type PaymentOption = {
  /** Identificador único para la opción de pago. */
  id: string;

  /** Nombre de la opción de pago. */
  name: string;

  /** Tipo de opción de pago (ej: tarjeta de crédito, transferencia bancaria). */
  type: string;

  /** Configuración adicional para la opción de pago. */
  config: {
    /** Si la opción de pago está habilitada. */
    enabled: boolean;

    /** Valor mínimo permitido para esta opción de pago. */
    min_amount: Nullable<number>;

    /** Valor máximo permitido para esta opción de pago. */
    max_amount: Nullable<number>;

    /** Lista de monedas soportadas. */
    currencies: string[];

    /** Lista de países soportados. */
    countries: string[];

    /** Si la opción de pago requiere un número de teléfono. */
    requires_phone: boolean;

    /** Si la opción de pago requiere un número de documento. */
    requires_document: boolean;

    /** Si la opción de pago requiere una dirección de facturación. */
    requires_billing_address: boolean;
  };

  /** Detalles adicionales de la opción de pago. */
  details: {
    /** URL del logo de la opción de pago. */
    logo_url: Nullable<string>;

    /** Descripción de la opción de pago. */
    description: Nullable<string>;

    /** Términos y condiciones de la opción de pago. */
    terms_and_conditions: Nullable<string>;

    /** Si la opción de pago soporta cuotas. */
    supports_installments: boolean;

    /** Número máximo de cuotas permitidas. */
    max_installments: Nullable<number>;

    /** Valor mínimo de la cuota. */
    min_installment_amount: Nullable<number>;

    /** Tasas de interés para cuotas. */
    installment_rates: Record<string, number>;
  };
};
```

## Notas

- Las propiedades marcadas como `Nullable<T>` pueden ser `null` dependiendo del contexto o página desde la que se acceden
- La propiedad `UI` contiene componentes inyectados dinámicamente y sus valores
- La propiedad `location` ayuda a determinar el contexto actual de la aplicación
- Todos los valores monetarios en la propiedad `cart` están en la moneda base de la tienda
- El estado es inmutable y solo puede ser modificado a través del método `send` de `NubeSDK` 