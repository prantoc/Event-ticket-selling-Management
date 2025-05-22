const mongoose = require("mongoose");
const slugify = require("../../utils/slugify");

const eventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventName: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    eventCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    eventImages: [String],
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    venue: {
      name: {
        type: String,
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      mapUrl: String,
    },
    totalCapacity: {
      type: Number,
      required: true,
    },
    ticketTiers: [
      {
        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        availableQuantity: {
          type: Number,
          required: true,
        },
        sold: {
          type: Number,
          default: 0,
        },
        maxPerOrder: {
          type: Number,
          default: 10,
        },
        salesStartDate: Date,
        salesEndDate: Date,
      },
    ],
    refundPolicy: {
      type: {
        type: String,
        enum: ["no-refunds", "time-based", "custom"],
        default: "time-based",
      },
      rules: [
        {
          daysBeforeEvent: Number,
          refundPercentage: Number,
          description: String,
        },
      ],
      customPolicy: String,
    },
    status: {
      type: String,
      enum: [
        "pending-approval",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending-approval",
    },
    approvalStatus: {
      approved: {
        type: Boolean,
        default: false,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: Date,
      rejectionReason: String,
    },
    publishedAt: Date,
    tags: [String],
    isFeature: {
      type: Boolean,
      default: false,
    },
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      uniqueVisitors: {
        type: Number,
        default: 0,
      },
    },
    revenue: {
      gross: {
        type: Number,
        default: 0,
      },
      platformCommission: {
        type: Number,
        default: 0,
      },
      net: {
        type: Number,
        default: 0,
      },
      refunded: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.pre("save", async function (next) {
  if (this.isModified("eventName")) {
    this.slug = slugify(this.eventName);
    const exists = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id },
    });
    if (exists) this.slug = `${this.slug}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
