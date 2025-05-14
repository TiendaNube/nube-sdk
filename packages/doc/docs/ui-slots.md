# UI Slots

UI slots are containers for UI components.
When you want to add a UI component, you need to specify their location on the screen, and to support the widest range of themes and layouts, we created predefined slots that are available across all templates that can be used to put your UI components inside.

## Checkout Slots

These are the slots that are available in checkout:

| Slot                  | Page                   |
| --------------------- | ---------------------- |
| before_main_content   | start, payment         |
| after_main_content    | start, payment         |
| after_line_items_price| start, payment         |
| before_line_items     | start                  |
| after_line_items      | start, payment         |
| after_contact_form    | start                  |
| after_address_form    | start                  |
| after_billing_form    | start                  |
| after_payment_options | payment                |
| before_address_form   | start                  |
| before_billing_form   | start                  |
| before_contact_form   | start                  |
| before_shipping_form  | start                  |
| after_shipping_form   | start                  |
| corner_top_left       | start, payment, finish |
| corner_top_right      | start, payment, finish |
| corner_bottom_left    | start, payment, finish |
| corner_bottom_right   | start, payment, finish |
| modal_content         | start, payment, finish |

### Desktop Slot location

![location of ui slots on checkout](/images/ui-slots-desktop-checkout.png)

### Mobile Location

![location of ui slots on checkout](/images/ui-slots-mobile-checkout.png)
