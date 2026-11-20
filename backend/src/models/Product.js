import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    flavor: { type: String, required: true, trim: true },
    spiceLevel: {
      type: String,
      required: true,
      enum: ['Suave', 'Medio', 'Intenso'],
    },
    price: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Product = mongoose.model('Product', productSchema)

export default Product
