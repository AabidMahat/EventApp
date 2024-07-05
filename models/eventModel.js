const mongoose = require("mongoose");

// Define schema based on JSON data
const eventSchema = new mongoose.Schema({
  imageurl: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  title: {
    type: String,
  },
  eventType: {
    type: String,
  },
  ticketprice: {
    type: String,
  },
  dateandtime: {
    type: String,
  },
  fullUrl: {
    type: String,
  },
  category: {
    type: String,
  },
  hashtags: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false, // Exclude from query results
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select: false, // Exclude from query results
  },
  titlelogourl: {
    type: String,
    default: "",
  },
  eventstartDate: {
    type: String,
    default: "",
  },
  eventendDate: {
    type: String,
    default: "",
  },
  hostedby: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  hostedbylogo: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    default: "",
  },
  hostdetails: {
    type: String,
    default: "",
  },
  hostIMG: {
    type: String,
    default: "",
  },
  imageURL: {
    type: String,
    default: "",
  },
  hostedbydepartment: {
    type: String,
    default: "",
  },
  hostedbyName: {
    type: String,
    default: "",
  },
  hostebylocation: {
    type: String,
    default: "",
  },
  OrganizerContact: {
    type: String,
    default: "",
  },
  howToReach: {
    type: String,
    default: "",
  },
  phone_numbers: {
    type: [String],
    default: [],
  },
  short_description: {
    type: String,
    default: "",
  },
});

// Create model
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
