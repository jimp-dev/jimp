# Vector fonts for the playground

The print playground loads these with `loadTTF`. They're copies of the test
fixtures in `plugins/plugin-print/fixtures/`: printable-ASCII subsets of Open
Sans Regular (TrueType) and Inter Regular (WOFF), made by
`plugins/plugin-print/scripts/subset-fonts.sh`. Characters outside printable
ASCII are drawn with the font's `.notdef` box.

Both fonts are under the SIL Open Font License 1.1 with no Reserved Font Name.
Their licences are `OpenSans-OFL.txt` and `Inter-OFL.txt`.
