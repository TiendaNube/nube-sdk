# Slots de UI

Slots de UI são contêineres para componentes de interface do usuário.
Quando você deseja adicionar um componente de UI, é necessário especificar sua localização na tela. Para suportar a maior variedade de temas e layouts, criamos slots predefinidos que estão disponíveis em todos os templates e podem ser usados para posicionar seus componentes de UI.

## Slots do Checkout

Estes são os slots disponíveis no checkout:

| Slot                  | Página                       |
| --------------------- | ---------------------------- |
| before_main_content   | início, pagamento            |
| after_main_content    | início, pagamento            |
| before_line_items     | início                       |
| after_line_items      | início, pagamento            |
| after_contact_form    | início                       |
| after_address_form    | início                       |
| after_billing_form    | início                       |
| after_payment_options | pagamento                    |
| before_address_form   | início                       |
| before_billing_form   | início                       |
| before_contact_form   | início                       |
| modal_content         | início, pagamento, conclusão |

### Localização dos Slots no Desktop

![localização dos slots de ui no checkout](/images/ui-slots-desktop-checkout.png)

### Localização no Mobile

![localização dos slots de ui no checkout](/images/ui-slots-mobile-checkout.png)
