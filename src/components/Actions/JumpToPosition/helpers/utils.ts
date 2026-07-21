"use client";

export const isPositionsListValid = (positionsList: any[] | null | undefined): boolean => {
  return !!(positionsList && positionsList.length > 0 && positionsList.some(item => item.locations?.position));
};;
