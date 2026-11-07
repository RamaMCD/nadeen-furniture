import Image from "next/image";
import { FRAME_GROUP_CLASS } from "@/lib/homepage-frames";

interface MaterialGallerySectionProps {
  materialGallery1: string;
  materialGallery2: string;
  materialGallery3: string;
}

const photoLabels = ["Woodcraft details", "Furniture collection", "Material details"];

export function MaterialGallerySection({
  materialGallery1,
  materialGallery2,
  materialGallery3,
}: MaterialGallerySectionProps) {
  const photos = [materialGallery1, materialGallery2, materialGallery3];

  return (
    <section className="py-12 lg:py-16" aria-label="Material and furniture details gallery">
      <div className={`${FRAME_GROUP_CLASS} px-6 lg:px-0`}>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
          {photos.map((src, index) => (
            <div
              key={photoLabels[index]}
              className="relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden sm:w-auto"
            >
              <Image
                src={src}
                alt={photoLabels[index]}
                fill
                loading="lazy"
                className="object-cover object-center"
                quality={80}
                sizes="(max-width: 640px) 78vw, (max-width: 896px) 30vw, 280px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
