# Slots de UI

Los slots de UI son contenedores para componentes de interfaz de usuario.
Cuando deseas agregar un componente de UI, necesitas especificar su ubicación en la pantalla. Para soportar la mayor variedad de temas y layouts, hemos creado slots predefinidos que están disponibles en todos los templates y pueden ser utilizados para posicionar tus componentes de UI.

## Slots del Checkout

Estos son los slots disponibles en el checkout:

| Slot                  | Página                    |
| --------------------- | --------------------------|
| before_main_content   | start, payment            |
| after_main_content    | start, payment            |
| after_line_items_price| start, payment            |
| before_line_items     | start                     |
| after_line_items      | start, payment            |
| after_contact_form    | start                     |
| after_address_form    | start                     |
| after_billing_form    | start                     |
| after_payment_options | payment                   |
| before_payment_options| payment                   |
| before_address_form   | start                     |
| before_billing_form   | start                     |
| before_contact_form   | start                     |
| before_shipping_form  | start                     |
| after_shipping_form   | start                     |
| corner_top_left       | start, payment, finish    |
| corner_top_right      | start, payment, finish    |
| corner_bottom_left    | start, payment, finish    |
| corner_bottom_right   | start, payment, finish    |
| modal_content         | start, payment, finish    |

### Ubicación de los Slots en Desktop

![ubicación de los slots de ui en el checkout](/images/ui-slots-desktop-checkout.png)

### Ubicación en Mobile

![ubicación de los slots de ui en el checkout](/images/ui-slots-mobile-checkout.png)
