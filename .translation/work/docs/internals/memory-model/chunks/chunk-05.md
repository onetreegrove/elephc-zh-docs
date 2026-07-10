### Performance characteristics

For a loop like `for ($i = 0; $i < 1000; $i++) { $s .= "x"; }`:

- Each iteration frees the old `$s` and allocates a new one
- Old blocks go to the free list, new blocks come from bump allocation (growing size)
- Net heap usage is O(N) for the final string, not O(N²)
- With 8MB heap, this handles thousands of iterations comfortably