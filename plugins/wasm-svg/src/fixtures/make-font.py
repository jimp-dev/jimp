# Makes square.ttf, a tiny font for the text tests. Its "A" is a square that
# fills the em box from the baseline up, so text renders to exact pixels.
#
#   uv run --with fonttools python make-font.py square.ttf
import sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

UPM = 1000

def square():
    pen = TTGlyphPen(None)
    pen.moveTo((0, 0))
    pen.lineTo((0, 1000))
    pen.lineTo((1000, 1000))
    pen.lineTo((1000, 0))
    pen.closePath()
    return pen.glyph()

def empty():
    return TTGlyphPen(None).glyph()

fb = FontBuilder(UPM, isTTF=True)
fb.setupGlyphOrder([".notdef", "A"])
fb.setupCharacterMap({ord("A"): "A"})
fb.setupGlyf({".notdef": empty(), "A": square()})
fb.setupHorizontalMetrics({".notdef": (1000, 0), "A": (1000, 0)})
fb.setupHorizontalHeader(ascent=1000, descent=0)
fb.setupNameTable({"familyName": "Jimp Test Square", "styleName": "Regular", "psName": "JimpTestSquare-Regular"})
fb.setupOS2(sTypoAscender=1000, sTypoDescender=0, usWinAscent=1000, usWinDescent=0)
fb.setupPost()
fb.save(sys.argv[1])
