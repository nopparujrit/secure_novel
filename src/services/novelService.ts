import { decryptContent } from "../utils/encryption";
import { toast } from "sonner";
import axios from "axios";

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not defined in environment variables, falling back to localhost');
}

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

export const getChapter = async (chapterNumber: number): Promise<Chapter | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chapters/${chapterNumber}`);
    console.log(API_BASE_URL);
    const chapter = response.data;
    
    const decrypted = await decryptContent(chapter.content);
    if (!decrypted) {
      toast.error("Failed to decrypt chapter content");
      return null;
    }
    
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

export const getAdjacentChapters = async (currentChapter: number): Promise<{ prev: number | null, next: number | null }> => {
  try {
    const chapters = await getAllChapters();
    const chapterNumbers = chapters.map(c => c.chapter).sort((a, b) => a - b);
    
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