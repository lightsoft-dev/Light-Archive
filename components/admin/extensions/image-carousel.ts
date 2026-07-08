import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageCarouselNodeView } from "../image-carousel-node-view"

/** 슬라이더에 들어가는 이미지 한 장의 정보 */
export interface CarouselImage {
  src: string
  alt?: string
}

// setImageCarousel 커맨드를 editor.chain()에서 타입 안전하게 쓰기 위한 선언 확장
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageCarousel: {
      /** 여러 이미지를 담은 슬라이더(캐러셀) 블록을 현재 위치에 삽입 */
      setImageCarousel: (images: CarouselImage[]) => ReturnType
    }
  }
}

/**
 * 이미지 슬라이더(캐러셀) 커스텀 노드.
 *
 * - `atom: true`: 내부에 편집 가능한 텍스트가 없는 "하나의 미디어 블록"으로 취급.
 *   (이미지 목록은 `images` 속성으로만 관리하고, 편집은 NodeView UI에서 한다)
 * - 저장 HTML 형태:
 *     <div data-type="image-carousel" class="image-carousel">
 *       <img src="..." alt="..." />
 *       <img src="..." alt="..." />
 *     </div>
 *   → 자식 <img>를 그대로 두어 SEO/이미지 로딩/하위호환에 유리하고,
 *     뷰어에서는 CSS scroll-snap + 화살표/dot로 슬라이더로 렌더한다.
 */
export const ImageCarousel = Node.create({
  name: "imageCarousel",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      images: {
        default: [] as CarouselImage[],
        // images는 div 속성이 아니라 "자식 <img>"로 직렬화하므로,
        // 개별 속성 renderHTML은 빈 객체(속성 없음)를 반환한다.
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-carousel"]',
        // 저장된 HTML을 다시 읽을 때: 자식 <img>들에서 src/alt를 모아 images 속성으로 복원
        getAttrs: (element: string | HTMLElement) => {
          if (typeof element === "string") return {}
          const el = element
          const imgs = Array.from(el.querySelectorAll("img"))
          return {
            images: imgs.map((img) => ({
              src: img.getAttribute("src") || "",
              alt: img.getAttribute("alt") || "",
            })),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const images = (node.attrs.images as CarouselImage[]) || []

    // div + 자식 img 배열. atom 노드라 content hole(0) 없이 고정 자식만 렌더한다.
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "image-carousel",
        class: "image-carousel",
      }),
      ...images.map(
        (img) =>
          [
            "img",
            {
              src: img.src,
              alt: img.alt || "",
              loading: "lazy",
            },
          ] as const
      ),
    ] as const
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageCarouselNodeView)
  },

  addCommands() {
    return {
      setImageCarousel:
        (images: CarouselImage[]) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { images },
          }),
    }
  },
})
