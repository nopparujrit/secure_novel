import { encryptText, decryptText } from "../utils/encryption";
import { toast } from "sonner";
import axios from "axios";

// Interfaces for novel data
export interface Chapter {
  chapter: number;
  content: string;
}

export interface NovelMetadata {
  totalChapters: number;
  title: string;
  author: string;
  lastUpdated: string;
}

// API base URL
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Get metadata about the novel
 * @returns Novel metadata
 */
export const getNovelMetadata = async (): Promise<NovelMetadata> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/novel/metadata`);
    return response.data;
  } catch (error) {
    console.error("Error fetching novel metadata:", error);
    toast.error("Failed to fetch novel metadata");
    throw error;
  }
};

/**
 * Get list of all chapters
 * @returns Array of chapters with chapter numbers
 */
export const getAllChapters = async (): Promise<{ chapter: number }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chapters`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    toast.error("Failed to fetch chapters list");
    throw error;
  }
};

/**
 * Get a specific chapter
 * @param chapterNumber Chapter number to fetch
 * @returns Chapter data or null if not found
 */
export const getChapter = async (chapterNumber: number): Promise<Chapter | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chapters/${chapterNumber}`);
    const chapter = response.data;
    
    // In a real app, data would come encrypted from server
    // Here we're simulating the encryption/decryption process locally
    // You might want to implement server-side encryption instead
    const encrypted = encryptText(chapter.content);
    const decrypted = decryptText(encrypted);
    //console.log(decrypted);
    return {
      chapter: chapter.chapter,
      content: decrypted
    };
  } catch (error) {
    console.error("Error fetching chapter:", error);
    toast.error("Failed to fetch chapter");
    return null;
  }
};

/**
 * Get chapter numbers before and after the current chapter
 * @param currentChapter Current chapter number
 * @returns Previous and next chapter numbers if they exist
 */
export const getAdjacentChapters = async (currentChapter: number): Promise<{ prev: number | null, next: number | null }> => {
  try {
    // Get all available chapters
    const chapters = await getAllChapters();
    const chapterNumbers = chapters.map(c => c.chapter).sort((a, b) => a - b);
    
    // Find current chapter index
    const currentIndex = chapterNumbers.indexOf(currentChapter);
    
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }
    
    return {
      prev: currentIndex > 0 ? chapterNumbers[currentIndex - 1] : null,
      next: currentIndex < chapterNumbers.length - 1 ? chapterNumbers[currentIndex + 1] : null
    };
  } catch (error) {
    console.error("Error getting adjacent chapters:", error);
    toast.error("Failed to get chapter navigation");
    return { prev: null, next: null };
  }
};