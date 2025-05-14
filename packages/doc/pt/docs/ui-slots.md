# Slots de UI

Slots de UI são contêineres para componentes de interface do usuário.
Quando você deseja adicionar um componente de UI, é necessário especificar sua localização na tela. Para suportar a maior variedade de temas e layouts, criamos slots predefinidos que estão disponíveis em todos os templates e podem ser usados para posicionar seus componentes de UI.

## Slots do Checkout

Estes são os slots disponíveis no checkout:

| Slot                  | Página                      |
| --------------------- | ----------------------------|
| before_main_content   | start, payment              |
| after_main_content    | start, payment              |
| after_line_items_price| start, payment              |
| before_line_items     | start                       |
| after_line_items      | start, payment              |
| after_contact_form    | start                       |
| after_address_form    | start                       |
| after_billing_form    | start                       |
| after_payment_options | payment                     |
| before_address_form   | start                       |
| before_billing_form   | start                       |
| before_contact_form   | start                       |
| before_shipping_form  | start                       |
| after_shipping_form   | start                       |
| corner_top_left       | start, payment, finish      |
| corner_top_right      | start, payment, finish      |
| corner_bottom_left    | start, payment, finish      |
| corner_bottom_right   | start, payment, finish      |
| modal_content         | start, payment, finish      |

### Localização dos Slots no Desktop

![localização dos slots de ui no checkout](/images/ui-slots-desktop-checkout.png)

### Localização no Mobile

![localização dos slots de ui no checkout](/images/ui-slots-mobile-checkout.png)
