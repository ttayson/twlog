const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Intelipost = new Schema(
  {
    intelipost_pre_shipment_list: {
      type: String,
    },
    origin_name: {
      type: String,
    },
    origin_federal_tax_payer_id: {
      type: String,
    },
    origin_customer_phone: {
      type: String,
    },
    origin_customer_email: {
      type: String,
    },
    origin_street: {
      type: String,
    },
    origin_number: {
      type: String,
    },
    origin_additional: {
      type: String,
    },
    origin_reference: {
      type: String,
    },
    origin_zip_code: {
      type: String,
    },
    origin_city: {
      type: String,
    },
    origin_quarter: {
      type: String,
    },
    origin_state_code: {
      type: String,
    },
    shipment_order_array: [
      {
        order_number: String,
        sales_order_number: String,
        scheduled: String,
        shipment_order_type: String,
        delivery_method_id: String,
        logistic_provider_id: String,
        end_customer: [
          {
            first_name: String,
            last_name: String,
            phone: String,
            cellphone: String,
            is_company: String,
            federal_tax_payer_id: String,
            shipping_address: String,
            shipping_number: String,
            shipping_additional: String,
            shipping_reference: String,
            shipping_quarter: String,
            shipping_city: String,
            shipping_zip_code: String,
            shipping_state: String,
            shipping_state_code: String,
            shipping_country: String,
          },
        ],
        shipment_order_volume_array: [
          {
            name: String,
            client_pre_shipment_list: String,
            shipment_order_volume_number: String,
            weight: String,
            volume_type_code: String,
            width: String,
            height: String,
            length: String,
            products_nature: String,
            products_quantity: String,
            is_icms_exempt: String,
            shipment_order_volume_invoice_array: [
              {
                invoice_series: String,
                invoice_number: String,
                invoice_key: String,
                invoice_date: String,
                invoice_date_iso: String,
                invoice_total_value: String,
                invoice_products_value: String,
                invoice_cfop: String,
                already_insured: String,
              },
            ],
            products: [
              {
                id: String,
                weight: String,
                width: String,
                height: String,
                length: String,
                price: String,
                description: String,
                sku: String,
                category: String,
                quantity: String,
                image_url: String,
              },
            ],
          },
        ],
        sales_channel: String,
      },
    ],
  },
  { timestamps: true }
);

mongoose.model("intelipost", Intelipost);
