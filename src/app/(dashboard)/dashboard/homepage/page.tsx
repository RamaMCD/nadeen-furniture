/**
 * ADMIN — Homepage Images
 * Halaman untuk mengganti semua gambar yang tampil di website publik.
 */

import { HomepageImagesManager } from "@/components/admin/homepage-images-manager";
import { getHomepageImages } from "@/lib/db/homepage-images";

export const metadata = { title: "Homepage Images — Admin" };

export default async function HomepageImagesPage() {
  const images = await getHomepageImages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Homepage Images</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ganti gambar yang tampil di setiap section homepage website.
        </p>
      </div>
      <HomepageImagesManager initialImages={images} />
    </div>
  );
}
