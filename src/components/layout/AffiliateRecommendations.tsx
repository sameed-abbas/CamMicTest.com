"use client";

import React from "react";
import { Video, Mic, Headphones, Wifi } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: "webcam" | "microphone" | "speaker" | "network";
  price: string;
  tagline: string;
  link: string;
}

const PRODUCTS: Product[] = [
  {
    id: "cam-logitech-c920",
    name: "Logitech C920x HD Pro Webcam",
    category: "webcam",
    price: "$69.99",
    tagline: "Industry-standard full HD 1080p camera with automatic light adjustment.",
    link: "https://www.amazon.com/s?k=Logitech+C920x+Pro",
  },
  {
    id: "cam-razer-kiyo",
    name: "Razer Kiyo Pro HDR Webcam",
    category: "webcam",
    price: "$99.99",
    tagline: "High-performance camera featuring adaptive light sensors for dim settings.",
    link: "https://www.amazon.com/s?k=Razer+Kiyo+Pro",
  },
  {
    id: "cam-logitech-brio",
    name: "Logitech Brio 4K Ultra HD Webcam",
    category: "webcam",
    price: "$199.99",
    tagline: "Premium business-class 4K camera with facial recognition and zoom capability.",
    link: "https://www.amazon.com/s?k=Logitech+Brio+4K",
  },
  {
    id: "mic-fifine-k669b",
    name: "FIFINE K669B USB Microphone",
    category: "microphone",
    price: "$34.99",
    tagline: "Ultra-compact metal body plug-and-play USB microphone with direct volume dial.",
    link: "https://www.amazon.com/s?k=Fifine+K669B+Microphone",
  },
  {
    id: "mic-blue-yeti",
    name: "Logitech G Blue Yeti USB Mic",
    category: "microphone",
    price: "$129.99",
    tagline: "Acclaimed studio USB mic with four pick-up patterns for vocal versatility.",
    link: "https://www.amazon.com/s?k=Blue+Yeti+Microphone",
  },
  {
    id: "mic-shure-mv7",
    name: "Shure MV7 Podcast Microphone",
    category: "microphone",
    price: "$249.99",
    tagline: "Professional Dynamic broadcast microphone supporting hybrid USB and XLR connections.",
    link: "https://www.amazon.com/s?k=Shure+MV7+Microphone",
  },
  {
    id: "head-logitech-g432",
    name: "Logitech G432 7.1 Wired Headset",
    category: "speaker",
    price: "$39.99",
    tagline: "Wired stereo headset delivering clear spatial surround sound.",
    link: "https://www.amazon.com/s?k=Logitech+G432+Headset",
  },
  {
    id: "head-hyperx-cloud",
    name: "HyperX Cloud II Pro Headset",
    category: "speaker",
    price: "$79.99",
    tagline: "Highly durable design with memory foam pads and Hi-Fi capable audio drivers.",
    link: "https://www.amazon.com/s?k=HyperX+Cloud+II+Headset",
  },
  {
    id: "net-ethernet-cat8",
    name: "DbillionDa Cat 8 Ethernet Cable",
    category: "network",
    price: "$12.99",
    tagline: "Shielded, high-capacity copper network cable supporting up to 40Gbps speeds.",
    link: "https://www.amazon.com/s?k=Cat+8+Ethernet+Cable",
  },
  {
    id: "net-tplink-router",
    name: "TP-Link AX1800 Wi-Fi 6 Router",
    category: "network",
    price: "$79.99",
    tagline: "Dual-band wireless router bringing fast Wi-Fi 6 connection speeds.",
    link: "https://www.amazon.com/s?k=TP-Link+AX1800+Wifi+6+Router",
  }
];

interface AffiliateRecommendationsProps {
  category?: "webcam" | "microphone" | "speaker" | "network" | "all";
}

export default function AffiliateRecommendations({
  category = "all",
}: AffiliateRecommendationsProps) {
  return null;
}
