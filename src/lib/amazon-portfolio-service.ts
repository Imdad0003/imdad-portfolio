import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  AmazonListingSample,
  APlusModuleSample,
  AmazonPricingPackage,
} from "@/types/amazon-portfolio";
import {
  amazonListingSamples,
  aPlusContentSamples,
  amazonPricingPackages,
} from "@/data/amazonListingData";

export async function getPublishedListingSamples(): Promise<AmazonListingSample[]> {
  if (!db) return amazonListingSamples;
  try {
    const q = query(collection(db, "amazonListings"), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as AmazonListingSample));
    }
  } catch (err) {
    console.warn("Firestore fetch for amazonListings fallback:", err);
  }
  return amazonListingSamples;
}

export async function getPublishedAPlusModules(): Promise<APlusModuleSample[]> {
  if (!db) return aPlusContentSamples;
  try {
    const q = query(collection(db, "amazonAPlusModules"), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as APlusModuleSample));
    }
  } catch (err) {
    console.warn("Firestore fetch for amazonAPlusModules fallback:", err);
  }
  return aPlusContentSamples;
}

export async function getPublishedAmazonPackages(): Promise<AmazonPricingPackage[]> {
  if (!db) return amazonPricingPackages;
  try {
    const q = query(collection(db, "amazonPackages"), orderBy("price", "asc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as AmazonPricingPackage));
    }
  } catch (err) {
    console.warn("Firestore fetch for amazonPackages fallback:", err);
  }
  return amazonPricingPackages;
}
