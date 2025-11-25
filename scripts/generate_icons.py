from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def generate_icon(size: int, target: Path) -> None:
    base = Image.new("RGBA", (size, size), (16, 24, 39, 255))
    draw = ImageDraw.Draw(base)
    inset = int(size * 0.15)
    draw.rounded_rectangle(
        (inset, inset, size - inset, size - inset),
        radius=int(size * 0.12),
        outline=(255, 255, 255, 255),
        width=max(4, size // 32),
    )
    font = ImageFont.load_default()
    text = "P"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text(
        ((size - text_width) / 2, (size - text_height) / 2),
        text,
        font=font,
        fill=(255, 255, 255, 255),
    )
    target.parent.mkdir(parents=True, exist_ok=True)
    base.save(target)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    icons_dir = root / "public" / "icons"
    generate_icon(192, icons_dir / "icon-192.png")
    generate_icon(512, icons_dir / "icon-512.png")


if __name__ == "__main__":
    main()

