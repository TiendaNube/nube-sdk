# Estado do App

O tipo `NubeSDKState` representa o estado completo de um app criado com o NubeSDK, fornecendo acesso a todos os dados e configurações disponíveis. Este objeto de estado é passado para várias funções do SDK, permitindo que os desenvolvedores acessem e reajam ao estado atual da aplicação.

A definição do tipo pode ser encontrada no pacote `@tiendanube/nube-sdk-types`.

```typescript
import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
```

## Como obter o estado

Existem 3 formas de obter o `NubeSDKState` na sua aplicação:

### 1. Função getState

Esta função retorna o estado atual do SDK, ideal para obter informações no início da aplicação.

```typescript
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // Obter o estado atual
  const currentState: Readonly<NubeSDKState> = nube.getState();

  // Acessar propriedades do estado
  const cartTotal = currentState.cart.total;
  const storeCurrency = currentState.store.currency;
  const currentPage = currentState.location.page.type;
}
```

### 2. Escutando Mudanças de Estado

Cada vez que um evento é disparado, a função de escuta recebe um snapshot do estado no momento do evento.

```typescript
import type { NubeSDK, NubeSDKState } from '@tiendanube/nube-sdk-types';

export function App(nube: NubeSDK) {
  // Escutar mudanças de estado
  nube.on('customer:update', (state: Readonly<NubeSDKState>) => {
    const customerEmail = state.customer.email;
    const customerAddress = state.customer.address;
  });
}
```

Para mais detalhes sobre como monitorar atualizações de estado e se inscrever em vários eventos de estado, consulte [Eventos](./events). Esta página fornece exemplos e explicações completos sobre como escutar atualizações como `cart:update`, `shipping:update` e mais, permitindo que você construa uma aplicação dinâmica e responsiva.

### 3. Modificador de Estado

Quando um evento é enviado, você pode definir uma função modificadora como segundo parâmetro. Esta função recebe um snapshot do estado e deve retornar uma versão parcial do estado para ser mesclada com o estado atual.

```tsx
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Enviar eventos com modificações de estado
  nube.send("ui:slot:set", (state: Readonly<NubeSDKState>) => {
    // Retornar um DeepPartial<NubeSDKState>
    const storeName = state.store.name;
    return {
      ui: {
        slots: {
          before_main_content: <Text>{`Olá ${storeName}!`}</Text>,
        },
      },
    };
  });
}
```

## `NubeSDKState`

A seguir você encontrará a definição completa do tipo `NubeSDKState`.

```typescript
export type NubeSDKState = {
  /**
   * O estado atual do carrinho, contendo produtos, preços e estado de validação.
   */
  cart: Cart;

  /**
   * Configurações de aplicação em todo o escopo, incluindo regras de validação do carrinho.
   */
  config: AppConfig;

  /**
   * A localização atual do usuário dentro da aplicação, incluindo o tipo de página e URL.
   */
  location: AppLocation;

  /**
   * Informações sobre a loja atual, como domínio, moeda e idioma.
   */
  store: Store;

  /**
   * Representa o estado relacionado à UI, incluindo componentes injetados dinamicamente e seus valores.
   */
  ui: UI;

  /**
   * Informações sobre envio, como opções disponíveis, opção selecionada e etiquetas personalizadas.
   * Esta propriedade pode ser nula dependendo da página da qual é acessada.
   */
  shipping: Nullable<Shipping>;

  /**
   * Detalhes sobre o cliente, incluindo identificação, informações de contato e endereço.
   */
  customer: Nullable<Customer>;

  /**
   * Informações sobre o método de pagamento, incluindo tipo, estado e opção selecionada.
   */
  payment: Nullable<Payment>;
};
```

## `cart`

O estado atual do carrinho, contendo produtos, preços e estado de validação.

```typescript
type Cart = {
  /** Identificador único para a sessão do carrinho. */
  id: string;

  /** Estado de validação do carrinho. */
  validation: CartValidation;

  /** Lista de produtos atualmente no carrinho. */
  items: Product[];

  /** Detalhamento dos detalhes de preços do carrinho. */
  prices: Prices;

  /** Cupom opcional aplicado ao carrinho. */
  coupon: Nullable<Coupon>;
};

type Product = {
  /** Identificador único para a instância do produto no carrinho. */
  id: number;

  /** Nome do produto. */
  name: string;

  /** Preço do produto em formato de string (para corresponder à resposta da API). */
  price: string;

  /** Quantidade deste produto no carrinho. */
  quantity: number;

  /** Indica se o produto se qualifica para frete grátis. */
  free_shipping: boolean;

  /** Identificador único para o produto (não específico do carrinho). */
  product_id: number;

  /** Identificador único para a variante do produto selecionada. */
  variant_id: number;

  /** URL da imagem em miniatura do produto. */
  thumbnail: string;

  /** Detalhes da variante, geralmente uma combinação de atributos selecionados. */
  variant_values: string;

  /** SKU (Unidade de Manutenção de Estoque) nulo para a variante do produto. */
  sku: Nullable<string>;

  /** Propriedades adicionais relacionadas ao produto (estrutura desconhecida). */
  properties: Array<unknown>;

  /** URL da página do produto. */
  url: string;

  /** Indica se o produto é elegível para financiamento Ahora 12. */
  is_ahora_12_eligible: boolean;
};

type Prices = {
  /** Desconto aplicado através de um cupom. */
  discount_coupon: number;

  /** Desconto aplicado através de um gateway de pagamento. */
  discount_gateway: number;

  /** Desconto aplicado através de uma promoção da loja. */
  discount_promotion: number;

  /** Custo do frete. */
  shipping: number;

  /** Subtotal antes de descontos e frete. */
  subtotal: number;

  /** Preço total final após todos os descontos e frete. */
  total: number;
};

type Coupon = {
  /** O código do cupom utilizado. */
  code: string;

  /** O tipo de desconto (porcentagem, fixo, etc.). */
  type: string;

  /** O valor do desconto (formato depende do `type`). */
  value: string;
};

/** O estado de validação do carrinho */
type CartValidation =
  | CartValidationSuccess
  | CartValidationPending
  | CartValidationFail;

type CartValidationSuccess = { status: "success" };
type CartValidationPending = { status: "pending" };
type CartValidationFail = { status: "fail"; reason: string };
```

## `config`

Configurações de aplicação em todo o escopo, incluindo regras de validação do carrinho.

```typescript
type AppConfig = {
  /** Determina se a validação do carrinho está habilitada. */
  has_cart_validation: boolean;

  /** Determina se o usuário pode selecionar uma opção de envio. */
  disable_shipping_more_options: boolean;
};
```

## `location`

A localização atual do usuário dentro da aplicação, incluindo o tipo de página e URL.

```typescript
type AppLocation = {
  /** A URL atual da aplicação. */
  url: string;

  /** O tipo de página atual e seus dados associados. */
  page: Page;

  /**
   * Parâmetros de consulta extraídos da URL.
   *
   * Cada chave representa o nome de um parâmetro de consulta, e seu valor
   * correspondente representa o valor desse parâmetro de consulta.
   */
  queries: Record<string, string>;
};

// Novas variações quebrarão com a evolução do NubeSDK
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

Informações sobre a loja atual, como domínio, moeda e idioma.

```typescript
type Store = {
  domain: string;
  currency: string;
  language: string;
  settings: StoreSettings;
};
```

## `ui`

Representa o estado relacionado à UI, incluindo componentes injetados dinamicamente e seus valores.

```typescript
type UI = {
  /**
   * Contém componentes injetados dinamicamente em slots específicos da UI.
   * Cada chave representa um nome de slot e seu valor é o componente a ser renderizado.
   */
  slots: UISlots;

  /**
   * Armazena valores associados com componentes específicos da UI, normalmente entradas de formulário.
   * AVISO: Estes valores são gerenciados internamente pelos componentes do SDK.
   * Modificá-los diretamente pode causar comportamento inesperado.
   */
  values: UIValues;
};

/**
 * Representa um mapeamento de slots de UI para seus respectivos componentes.
 */
type UISlots = Partial<Record<UISlot, NubeComponent>>;

/**
 * Representa um mapeamento de IDs de componentes de UI para seus respectivos valores.
 */
type UIValues = Record<NubeComponentId, UIValue>;

/**
 * Representa um slot de UI onde os componentes podem ser injetados dinamicamente.
 */
type UISlot =
  | "before_main_content" // Antes do conteúdo principal do checkout
  | "after_main_content" // Depois do conteúdo principal do checkout
  | "after_line_items_price" // Depois do preço dos itens no checkout
  | "before_line_items" // Antes da lista de itens no carrinho
  | "after_line_items" // Depois da lista de itens no carrinho
  | "after_contact_form" // Depois do formulário de contato no checkout
  | "after_address_form" // Depois do formulário de endereço no checkout
  | "after_billing_form" // Depois do formulário de faturamento no checkout
  | "after_payment_options" // Depois das opções de pagamento no checkout
  | "before_payment_options" // Antes das opções de pagamento no checkout
  | "before_address_form" // Antes do formulário de endereço no checkout
  | "before_billing_form" // Antes do formulário de faturamento no checkout
  | "before_contact_form" // Antes do formulário de contato no checkout
  | "before_shipping_form" // Antes do formulário de envio no checkout
  | "after_shipping_form" // Depois do formulário de envio no checkout
  | "corner_top_left" // Canto superior esquerdo do checkout
  | "corner_top_right" // Canto superior direito do checkout
  | "corner_bottom_left" // Canto inferior esquerdo do checkout
  | "corner_bottom_right" // Canto inferior direito do checkout
  | "modal_content"; // Conteúdo de um diálogo modal no checkout

/**
 * Representa o valor de um componente de UI, tipicamente usado para entradas de formulário.
 */
type UIValue = string;

/**
 * Representa um identificador único para um componente de UI.
 */
type NubeComponentId = string;
```

## `shipping`

Informações sobre envio, como opções disponíveis, opção selecionada e rótulos personalizados.
Esta propriedade pode ser nula dependendo da página da qual é acessada.

```typescript
type Shipping = {
  /** ID da opção de envio selecionada. */
  selected: Nullable<string>;

  /** Lista de opções de envio disponíveis. */
  options: ShippingOption[];

  /** Rótulos personalizados atribuídas às opções de envio. */
  custom_labels: Record<string, string>;
};

type ShippingOption = {
  /** Identificador único para a opção de envio. */
  id: string;

  /** Nome original da opção de envio. */
  original_name: Nullable<string>;

  /** Nome de exibição da opção de envio. */
  name: Nullable<string>;

  /** Código do método de envio. */
  code: Nullable<string>;

  /** Código de referência para a opção de envio. */
  reference: Nullable<string>;

  /** Tipo de método de envio. */
  type: Nullable<string>;

  /** Preço da opção de envio. */
  price: number;

  /** Preço do comerciante da opção de envio. */
  price_merchant: number;

  /** Moeda do custo de envio. */
  currency: string;

  /** Data mínima estimada de entrega. */
  min_delivery_date: Nullable<string>;

  /** Data máxima estimada de entrega. */
  max_delivery_date: Nullable<string>;

  /** Indica se é necessário um número de telefone para o envio. */
  phone_required: boolean;

  /** Indica se é necessário um ID para o envio. */
  id_required: boolean;

  /** Indica se aceita pagamento contra reembolso. */
  accepts_cod: boolean;

  /** Indica elegibilidade para frete grátis. */
  free_shipping_eligible: boolean;

  /** Detalhes adicionais de envio. */
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

  /** Identificador do método de envio. */
  method: Nullable<string>;

  /** ID da aplicação associada à opção de envio. */
  app_id: Nullable<string>;

  /** Indica se a opção de envio está oculta. */
  hidden: boolean;

  /** Prioridade da opção de envio. */
  priority: Nullable<number>;

  /** Indica se a opção de envio está disponível. */
  shippable: boolean;

  /** Código interno da opção de envio. */
  shipping_internal_option_code: Nullable<string>;

  /** Chave de assinatura para a opção de envio. */
  sign_key: Nullable<string>;

  /** Informações de data inteligente para estimativas de entrega. */
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

Detalhes sobre o cliente, incluindo identificação, informações de contato e endereço.
Esta propriedade pode ser nula dependendo da página da qual é acessada.

```typescript
type Customer = {
  /** Identificador único do cliente. **/
  id: Nullable<number>;

  /** Informações de contato do cliente. */
  contact: {
    /** Endereço de e-mail do cliente. */
    email: Nullable<string>;

    /** Nome completo do cliente. */
    name: Nullable<string>;

    /** Número de telefone do cliente. */
    phone: Nullable<string>;

    /** Se o cliente aceita comunicações de marketing. */
    accepts_marketing: Nullable<boolean>;

    /** Timestamp de quando as preferências de marketing foram atualizadas pela última vez. */
    accepts_marketing_updated_at: Nullable<string>;
  };

  /** Endereço de envio do cliente. */
  shipping_address: ShippingAddress;

  /** Endereço de faturamento do cliente. */
  billing_address: BillingAddress;
};

type Address = {
  /** Código postal do endereço. */
  zipcode: string;

  /** Primeiro nome do proprietário do endereço. */
  first_name: Nullable<string>;

  /** Sobrenome do proprietário do endereço. */
  last_name: Nullable<string>;

  /** Endereço da rua. */
  address: Nullable<string>;

  /** Número da rua. */
  number: Nullable<string>;

  /** Andar ou número do apartamento. */
  floor: Nullable<string>;

  /** Bairro ou localidade. */
  locality: Nullable<string>;

  /** Nome da cidade. */
  city: Nullable<string>;

  /** Estado ou província. */
  state: Nullable<string>;

  /** Nome do país. */
  country: Nullable<string>;

  /** Número de telefone associado ao endereço. */
  phone: Nullable<string>;
};

type ShippingAddress = Address & {
  /** Informação adicional do endereço entre ruas. */
  between_street: Nullable<string>;

  /** Pontos de referência ou informação adicional do endereço. */
  reference: Nullable<string>;
};

type BillingAddress = Address & {
  /** Número de identificação fiscal. */
  id_number: Nullable<string>;

  /** Tipo de cliente (pessoa física ou jurídica). */
  customer_type: Nullable<string>;

  /** Nome legal da empresa. */
  business_name: Nullable<string>;

  /** Nome comercial ou nome fantasia. */
  trade_name: Nullable<string>;

  /** Número de inscrição estadual. */
  state_registration: Nullable<string>;

  /** Classificação do regime fiscal. */
  fiscal_regime: Nullable<string>;

  /** Classificação de uso da nota fiscal. */
  invoice_use: Nullable<string>;

  /** Tipo de documento de identificação. */
  document_type: Nullable<string>;

  /** Atividade ou setor empresarial. */
  business_activity: Nullable<string>;
};
```

## `payment`

Informações sobre o método de pagamento, incluindo tipo, estado e opção selecionada.
Esta propriedade pode ser nula dependendo da página da qual é acessada.

```typescript
type Payment = {
  /** O método de pagamento selecionado. */
  method: string;

  /** O estado atual do pagamento. */
  status: PaymentStatus;

  /** Os detalhes da opção de pagamento selecionada. */
  selectedOption: Nullable<PaymentOption>;
};

/** Representa os possíveis estados de pagamento. */
type PaymentStatus =
  | "pending" // O pagamento está pendente de processamento
  | "processing" // O pagamento está sendo processado
  | "approved" // O pagamento foi aprovado
  | "rejected" // O pagamento foi rejeitado
  | "failed" // O pagamento falhou
  | "cancelled"; // O pagamento foi cancelado

/** Representa uma opção de pagamento com seus detalhes. */
type PaymentOption = {
  /** Identificador único para a opção de pagamento. */
  id: string;

  /** Nome da opção de pagamento. */
  name: string;

  /** Tipo de opção de pagamento (ex: cartão de crédito, transferência bancária). */
  type: string;

  /** Configuração adicional para a opção de pagamento. */
  config: {
    /** Se a opção de pagamento está habilitada. */
    enabled: boolean;

    /** Valor mínimo permitido para esta opção de pagamento. */
    min_amount: Nullable<number>;

    /** Valor máximo permitido para esta opção de pagamento. */
    max_amount: Nullable<number>;

    /** Lista de moedas suportadas. */
    currencies: string[];

    /** Lista de países suportados. */
    countries: string[];

    /** Se a opção de pagamento requer um número de telefone. */
    requires_phone: boolean;

    /** Se a opção de pagamento requer um número de documento. */
    requires_document: boolean;

    /** Se a opção de pagamento requer um endereço de faturamento. */
    requires_billing_address: boolean;
  };

  /** Detalhes adicionais da opção de pagamento. */
  details: {
    /** URL do logo da opção de pagamento. */
    logo_url: Nullable<string>;

    /** Descrição da opção de pagamento. */
    description: Nullable<string>;

    /** Termos e condições da opção de pagamento. */
    terms_and_conditions: Nullable<string>;

    /** Se a opção de pagamento suporta parcelas. */
    supports_installments: boolean;

    /** Número máximo de parcelas permitidas. */
    max_installments: Nullable<number>;

    /** Valor mínimo da parcela. */
    min_installment_amount: Nullable<number>;

    /** Taxas de juros para parcelas. */
    installment_rates: Record<string, number>;
  };
};
```

## Notas

- As propriedades marcadas como `Nullable<T>` podem ser `null` dependendo do contexto ou página da qual são acessadas
- A propriedade `UI` contém componentes injetados dinamicamente e seus valores associados.
- A propriedade `location` ajuda a determinar o contexto atual da aplicação
- Todos os valores monetários na propriedade `cart` estão na moeda base da loja
- O estado é imutável e só pode ser modificado através do método `send` do `NubeSDK` 