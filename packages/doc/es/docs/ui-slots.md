# Slots de UI

Los slots de UI son contenedores para componentes de interfaz de usuario.
Cuando deseas agregar un componente de UI, necesitas especificar su ubicación en la pantalla. Para soportar la mayor variedad de temas y layouts, hemos creado slots predefinidos que están disponibles en todos los templates y pueden ser utilizados para posicionar tus componentes de UI.

## Slots del Checkout

Estos son los slots disponibles en el checkout:

| Slot                  | Página                     |
| --------------------- | -------------------------- |
| before_main_content   | inicio, pago               |
| after_main_content    | inicio, pago               |
| before_line_items     | inicio                     |
| after_line_items      | inicio, pago               |
| after_contact_form    | inicio                     |
| after_address_form    | inicio                     |
| after_billing_form    | inicio                     |
| after_payment_options | pago                       |
| before_address_form   | inicio                     |
| before_billing_form   | inicio                     |
| before_contact_form   | inicio                     |
| modal_content         | inicio, pago, finalización |

### Ubicación de los Slots en Desktop

![ubicación de los slots de ui en el checkout](/images/ui-slots-desktop-checkout.png)

### Ubicación en Mobile

![ubicación de los slots de ui en el checkout](/images/ui-slots-mobile-checkout.png)
