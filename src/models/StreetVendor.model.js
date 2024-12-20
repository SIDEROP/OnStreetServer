import mongoose from 'mongoose';

const StreetVendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    businessType: { type: String, required: true },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    avatar: {
      type: String,
      default: function () {
        return `https://avatar.iran.liara.run/username?username=${this.name}&bold=false&length=1`;
      },
    },
    availability: { type: Boolean, default: true },
    role: { type: String, enum: ['vendor'], default: 'vendor' },
  },
  { timestamps: true },
);

StreetVendorSchema.index({ location: '2dsphere' });

export default mongoose.model('StreetVendor', StreetVendorSchema);