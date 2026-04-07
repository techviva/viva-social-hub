export type Platform = "instagram" | "tiktok" | "youtube";
export type PostStatus = "borrador" | "listo" | "publicado";

export interface Post {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  status: PostStatus;
  scheduledDate: string;
  image: string;
  tags: string[];
}

export const posts: Post[] = [
  {
    id: "1",
    title: "Transformacion patio trasero",
    description: "Before & after de instalacion de pavers en Phoenix",
    platform: "instagram",
    status: "publicado",
    scheduledDate: "2026-04-07T10:00:00",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
    tags: ["pavers", "before-after"],
  },
  {
    id: "2",
    title: "5 Tips para tu jardin en verano",
    description: "Consejos de mantenimiento para clima desertico",
    platform: "tiktok",
    status: "listo",
    scheduledDate: "2026-04-08T14:00:00",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    tags: ["tips", "verano"],
  },
  {
    id: "3",
    title: "Proyecto completo: Pergola moderna",
    description: "Video walkthrough de instalacion de pergola de aluminio",
    platform: "youtube",
    status: "borrador",
    scheduledDate: "2026-04-09T12:00:00",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop",
    tags: ["pergola", "proyecto"],
  },
  {
    id: "4",
    title: "Turf sintetico vs natural",
    description: "Comparativa visual de ambas opciones para Arizona",
    platform: "instagram",
    status: "listo",
    scheduledDate: "2026-04-09T09:00:00",
    image: "https://images.unsplash.com/photo-1558635924-b60e7d301b09?w=400&h=400&fit=crop",
    tags: ["turf", "comparativa"],
  },
  {
    id: "5",
    title: "Iluminacion de paisaje nocturna",
    description: "Showcase de sistema de iluminacion LED en jardin",
    platform: "tiktok",
    status: "publicado",
    scheduledDate: "2026-04-06T18:00:00",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop",
    tags: ["iluminacion", "nocturno"],
  },
  {
    id: "6",
    title: "Guia de softscape desertico",
    description: "Tutorial completo de plantas nativas para Phoenix",
    platform: "youtube",
    status: "borrador",
    scheduledDate: "2026-04-11T15:00:00",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop",
    tags: ["softscape", "plantas"],
  },
  {
    id: "7",
    title: "Drone shot: proyecto residencial",
    description: "Vista aerea de remodelacion completa de patio",
    platform: "instagram",
    status: "listo",
    scheduledDate: "2026-04-10T11:00:00",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
    tags: ["drone", "aereo"],
  },
  {
    id: "8",
    title: "Testimonio: Familia Rodriguez",
    description: "Cliente satisfecho con su nueva area de entretenimiento",
    platform: "tiktok",
    status: "borrador",
    scheduledDate: "2026-04-12T16:00:00",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop",
    tags: ["testimonio", "cliente"],
  },
  {
    id: "9",
    title: "Proceso de instalacion de pavers",
    description: "Time-lapse de proyecto de 3 dias en Scottsdale",
    platform: "youtube",
    status: "listo",
    scheduledDate: "2026-04-10T13:00:00",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=400&fit=crop",
    tags: ["pavers", "timelapse"],
  },
  {
    id: "10",
    title: "Oferta de primavera: 15% descuento",
    description: "Promo especial para nuevos proyectos de landscape",
    platform: "instagram",
    status: "publicado",
    scheduledDate: "2026-04-05T08:00:00",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop",
    tags: ["promo", "oferta"],
  },
  {
    id: "11",
    title: "Fire pit: diseno y construccion",
    description: "Mini documental de fire pit personalizado",
    platform: "youtube",
    status: "borrador",
    scheduledDate: "2026-04-14T14:00:00",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop",
    tags: ["firepit", "construccion"],
  },
  {
    id: "12",
    title: "Mantenimiento semanal express",
    description: "Rutina de 15 minutos para tu jardin perfecto",
    platform: "tiktok",
    status: "listo",
    scheduledDate: "2026-04-11T10:00:00",
    image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&h=400&fit=crop",
    tags: ["mantenimiento", "tips"],
  },
];
