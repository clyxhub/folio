// Folio — template recipe → layout component maps.

import {
  CoverMinimalist,
  CoverAesthetic,
  CoverSimple,
  CoverClassic,
  CoverVintage,
  CoverModern,
  CoverTypographic,
  CoverCollage,
  CoverBold,
} from "./CoverLayouts";
import {
  WorkAiry,
  WorkFramed,
  WorkEditorial,
  WorkPlate,
  WorkOrnate,
  WorkColumns,
  WorkNumbered,
  WorkMasonry,
  WorkFullBleed,
} from "./WorkLayouts";
import { TocList, TocThumbs, TocIndex, CvList, CvColumns } from "./PageLayouts";

export const COVERS = {
  minimalist: CoverMinimalist,
  aesthetic: CoverAesthetic,
  simple: CoverSimple,
  classic: CoverClassic,
  vintage: CoverVintage,
  modern: CoverModern,
  typographic: CoverTypographic,
  collage: CoverCollage,
  bold: CoverBold,
};

export const WORK_LAYOUTS = {
  airy: WorkAiry,
  framed: WorkFramed,
  editorial: WorkEditorial,
  plate: WorkPlate,
  ornate: WorkOrnate,
  columns: WorkColumns,
  numbered: WorkNumbered,
  masonry: WorkMasonry,
  fullBleed: WorkFullBleed,
};

export const TOC_LAYOUTS = {
  list: TocList,
  thumbs: TocThumbs,
  index: TocIndex,
};

export const CV_LAYOUTS = {
  list: CvList,
  columns: CvColumns,
};
