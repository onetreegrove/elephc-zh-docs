export const sidebar = {
  "/docs/": [
    {
      "text": "文档",
      "items": [
        {
          "text": "总览",
          "link": "/docs/"
        },
        {
          "text": "Beyond Php",
          "collapsed": true,
          "items": [
            {
              "text": "Buffers",
              "link": "/docs/beyond-php/buffers"
            },
            {
              "text": "Linux:  auth.php -> libauth.so",
              "link": "/docs/beyond-php/cdylib"
            },
            {
              "text": "Extern",
              "link": "/docs/beyond-php/extern"
            },
            {
              "text": "Ifdef",
              "link": "/docs/beyond-php/ifdef"
            },
            {
              "text": "Packed Classes",
              "link": "/docs/beyond-php/packed-classes"
            },
            {
              "text": "Pointers",
              "link": "/docs/beyond-php/pointers"
            },
            {
              "text": "app.php -> app  (a self-contained HTTP server binary)",
              "link": "/docs/beyond-php/web"
            }
          ]
        },
        {
          "text": "Compiling",
          "collapsed": true,
          "items": [
            {
              "text": "Cli Reference",
              "link": "/docs/compiling/cli-reference"
            },
            {
              "text": "Compilation Pipeline",
              "link": "/docs/compiling/compilation-pipeline"
            },
            {
              "text": "Linking And Conditional Compilation",
              "link": "/docs/compiling/linking-and-conditional-compilation"
            },
            {
              "text": "Default: EIR optimization passes enabled",
              "link": "/docs/compiling/optimization"
            },
            {
              "text": "Output And Diagnostics",
              "link": "/docs/compiling/output-and-diagnostics"
            },
            {
              "text": "Overview",
              "link": "/docs/compiling/overview"
            },
            {
              "text": "Targets",
              "link": "/docs/compiling/targets"
            }
          ]
        },
        {
          "text": "Getting Started",
          "collapsed": true,
          "items": [
            {
              "text": "Installation",
              "link": "/docs/getting-started/installation"
            },
            {
              "text": "Print per-phase compiler timings to stderr",
              "link": "/docs/getting-started/your-first-program"
            }
          ]
        },
        {
          "text": "How To",
          "collapsed": true,
          "items": [
            {
              "text": "Fiber Web Server",
              "link": "/docs/how-to/fiber-web-server"
            }
          ]
        },
        {
          "text": "Internals",
          "collapsed": true,
          "items": [
            {
              "text": "Architecture",
              "link": "/docs/internals/architecture"
            },
            {
              "text": "Arm64 Assembly",
              "link": "/docs/internals/arm64-assembly"
            },
            {
              "text": "Arm64 Instructions",
              "link": "/docs/internals/arm64-instructions"
            },
            {
              "text": "Builtins",
              "collapsed": true,
              "items": [
                {
                  "text": " Internal",
                  "collapsed": true,
                  "items": [
                    {
                      "text": " Elephc Gmmktime Raw",
                      "link": "/docs/internals/builtins/_internal/__elephc_gmmktime_raw"
                    },
                    {
                      "text": " Elephc Mktime Raw",
                      "link": "/docs/internals/builtins/_internal/__elephc_mktime_raw"
                    },
                    {
                      "text": " Elephc Phar Bzip2 Archive",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_bzip2_archive"
                    },
                    {
                      "text": " Elephc Phar Decompress Archive",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_decompress_archive"
                    },
                    {
                      "text": " Elephc Phar Get File Metadata",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_get_file_metadata"
                    },
                    {
                      "text": " Elephc Phar Get Metadata",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_get_metadata"
                    },
                    {
                      "text": " Elephc Phar Get Signature Hash",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_get_signature_hash"
                    },
                    {
                      "text": " Elephc Phar Get Signature Type",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_get_signature_type"
                    },
                    {
                      "text": " Elephc Phar Get Stub",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_get_stub"
                    },
                    {
                      "text": " Elephc Phar Gzip Archive",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_gzip_archive"
                    },
                    {
                      "text": " Elephc Phar List Entries",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_list_entries"
                    },
                    {
                      "text": " Elephc Phar Set Compression",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_set_compression"
                    },
                    {
                      "text": " Elephc Phar Set File Metadata",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_set_file_metadata"
                    },
                    {
                      "text": " Elephc Phar Set Metadata",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_set_metadata"
                    },
                    {
                      "text": " Elephc Phar Set Stub",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_set_stub"
                    },
                    {
                      "text": " Elephc Phar Set Zip Password",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_set_zip_password"
                    },
                    {
                      "text": " Elephc Phar Sign Hash",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_sign_hash"
                    },
                    {
                      "text": " Elephc Phar Sign Openssl",
                      "link": "/docs/internals/builtins/_internal/__elephc_phar_sign_openssl"
                    },
                    {
                      "text": " Elephc Strtotime Raw",
                      "link": "/docs/internals/builtins/_internal/__elephc_strtotime_raw"
                    }
                  ]
                },
                {
                  "text": "Array",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Array All",
                      "link": "/docs/internals/builtins/array/array_all"
                    },
                    {
                      "text": "Array Any",
                      "link": "/docs/internals/builtins/array/array_any"
                    },
                    {
                      "text": "Array Chunk",
                      "link": "/docs/internals/builtins/array/array_chunk"
                    },
                    {
                      "text": "Array Column",
                      "link": "/docs/internals/builtins/array/array_column"
                    },
                    {
                      "text": "Array Combine",
                      "link": "/docs/internals/builtins/array/array_combine"
                    },
                    {
                      "text": "Array Diff",
                      "link": "/docs/internals/builtins/array/array_diff"
                    },
                    {
                      "text": "Array Diff Assoc",
                      "link": "/docs/internals/builtins/array/array_diff_assoc"
                    },
                    {
                      "text": "Array Diff Key",
                      "link": "/docs/internals/builtins/array/array_diff_key"
                    },
                    {
                      "text": "Array Fill",
                      "link": "/docs/internals/builtins/array/array_fill"
                    },
                    {
                      "text": "Array Fill Keys",
                      "link": "/docs/internals/builtins/array/array_fill_keys"
                    },
                    {
                      "text": "Array Filter",
                      "link": "/docs/internals/builtins/array/array_filter"
                    },
                    {
                      "text": "Array Find",
                      "link": "/docs/internals/builtins/array/array_find"
                    },
                    {
                      "text": "Array Flip",
                      "link": "/docs/internals/builtins/array/array_flip"
                    },
                    {
                      "text": "Array Intersect",
                      "link": "/docs/internals/builtins/array/array_intersect"
                    },
                    {
                      "text": "Array Intersect Assoc",
                      "link": "/docs/internals/builtins/array/array_intersect_assoc"
                    },
                    {
                      "text": "Array Intersect Key",
                      "link": "/docs/internals/builtins/array/array_intersect_key"
                    },
                    {
                      "text": "Array Is List",
                      "link": "/docs/internals/builtins/array/array_is_list"
                    },
                    {
                      "text": "Array Key Exists",
                      "link": "/docs/internals/builtins/array/array_key_exists"
                    },
                    {
                      "text": "Array Key First",
                      "link": "/docs/internals/builtins/array/array_key_first"
                    },
                    {
                      "text": "Array Key Last",
                      "link": "/docs/internals/builtins/array/array_key_last"
                    },
                    {
                      "text": "Array Keys",
                      "link": "/docs/internals/builtins/array/array_keys"
                    },
                    {
                      "text": "Array Map",
                      "link": "/docs/internals/builtins/array/array_map"
                    },
                    {
                      "text": "Array Merge",
                      "link": "/docs/internals/builtins/array/array_merge"
                    },
                    {
                      "text": "Array Merge Recursive",
                      "link": "/docs/internals/builtins/array/array_merge_recursive"
                    },
                    {
                      "text": "Array Multisort",
                      "link": "/docs/internals/builtins/array/array_multisort"
                    },
                    {
                      "text": "Array Pad",
                      "link": "/docs/internals/builtins/array/array_pad"
                    },
                    {
                      "text": "Array Pop",
                      "link": "/docs/internals/builtins/array/array_pop"
                    },
                    {
                      "text": "Array Product",
                      "link": "/docs/internals/builtins/array/array_product"
                    },
                    {
                      "text": "Array Push",
                      "link": "/docs/internals/builtins/array/array_push"
                    },
                    {
                      "text": "Array Rand",
                      "link": "/docs/internals/builtins/array/array_rand"
                    },
                    {
                      "text": "Array Reduce",
                      "link": "/docs/internals/builtins/array/array_reduce"
                    },
                    {
                      "text": "Array Replace",
                      "link": "/docs/internals/builtins/array/array_replace"
                    },
                    {
                      "text": "Array Replace Recursive",
                      "link": "/docs/internals/builtins/array/array_replace_recursive"
                    },
                    {
                      "text": "Array Reverse",
                      "link": "/docs/internals/builtins/array/array_reverse"
                    },
                    {
                      "text": "Array Search",
                      "link": "/docs/internals/builtins/array/array_search"
                    },
                    {
                      "text": "Array Shift",
                      "link": "/docs/internals/builtins/array/array_shift"
                    },
                    {
                      "text": "Array Slice",
                      "link": "/docs/internals/builtins/array/array_slice"
                    },
                    {
                      "text": "Array Splice",
                      "link": "/docs/internals/builtins/array/array_splice"
                    },
                    {
                      "text": "Array Sum",
                      "link": "/docs/internals/builtins/array/array_sum"
                    },
                    {
                      "text": "Array Udiff",
                      "link": "/docs/internals/builtins/array/array_udiff"
                    },
                    {
                      "text": "Array Uintersect",
                      "link": "/docs/internals/builtins/array/array_uintersect"
                    },
                    {
                      "text": "Array Unique",
                      "link": "/docs/internals/builtins/array/array_unique"
                    },
                    {
                      "text": "Array Unshift",
                      "link": "/docs/internals/builtins/array/array_unshift"
                    },
                    {
                      "text": "Array Values",
                      "link": "/docs/internals/builtins/array/array_values"
                    },
                    {
                      "text": "Array Walk",
                      "link": "/docs/internals/builtins/array/array_walk"
                    },
                    {
                      "text": "Array Walk Recursive",
                      "link": "/docs/internals/builtins/array/array_walk_recursive"
                    },
                    {
                      "text": "Arsort",
                      "link": "/docs/internals/builtins/array/arsort"
                    },
                    {
                      "text": "Asort",
                      "link": "/docs/internals/builtins/array/asort"
                    },
                    {
                      "text": "Count",
                      "link": "/docs/internals/builtins/array/count"
                    },
                    {
                      "text": "In Array",
                      "link": "/docs/internals/builtins/array/in_array"
                    },
                    {
                      "text": "Krsort",
                      "link": "/docs/internals/builtins/array/krsort"
                    },
                    {
                      "text": "Ksort",
                      "link": "/docs/internals/builtins/array/ksort"
                    },
                    {
                      "text": "Natcasesort",
                      "link": "/docs/internals/builtins/array/natcasesort"
                    },
                    {
                      "text": "Natsort",
                      "link": "/docs/internals/builtins/array/natsort"
                    },
                    {
                      "text": "Range",
                      "link": "/docs/internals/builtins/array/range"
                    },
                    {
                      "text": "Rsort",
                      "link": "/docs/internals/builtins/array/rsort"
                    },
                    {
                      "text": "Shuffle",
                      "link": "/docs/internals/builtins/array/shuffle"
                    },
                    {
                      "text": "Sort",
                      "link": "/docs/internals/builtins/array/sort"
                    },
                    {
                      "text": "Uasort",
                      "link": "/docs/internals/builtins/array/uasort"
                    },
                    {
                      "text": "Uksort",
                      "link": "/docs/internals/builtins/array/uksort"
                    },
                    {
                      "text": "Usort",
                      "link": "/docs/internals/builtins/array/usort"
                    }
                  ]
                },
                {
                  "text": "Buffer",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Buffer Free",
                      "link": "/docs/internals/builtins/buffer/buffer_free"
                    },
                    {
                      "text": "Buffer Len",
                      "link": "/docs/internals/builtins/buffer/buffer_len"
                    }
                  ]
                },
                {
                  "text": "Class",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Class Alias",
                      "link": "/docs/internals/builtins/class/class_alias"
                    },
                    {
                      "text": "Class Attribute Args",
                      "link": "/docs/internals/builtins/class/class_attribute_args"
                    },
                    {
                      "text": "Class Attribute Names",
                      "link": "/docs/internals/builtins/class/class_attribute_names"
                    },
                    {
                      "text": "Class Exists",
                      "link": "/docs/internals/builtins/class/class_exists"
                    },
                    {
                      "text": "Class Get Attributes",
                      "link": "/docs/internals/builtins/class/class_get_attributes"
                    },
                    {
                      "text": "Class Implements",
                      "link": "/docs/internals/builtins/class/class_implements"
                    },
                    {
                      "text": "Class Parents",
                      "link": "/docs/internals/builtins/class/class_parents"
                    },
                    {
                      "text": "Class Uses",
                      "link": "/docs/internals/builtins/class/class_uses"
                    },
                    {
                      "text": "Enum Exists",
                      "link": "/docs/internals/builtins/class/enum_exists"
                    },
                    {
                      "text": "Function Exists",
                      "link": "/docs/internals/builtins/class/function_exists"
                    },
                    {
                      "text": "Get Class",
                      "link": "/docs/internals/builtins/class/get_class"
                    },
                    {
                      "text": "Get Declared Classes",
                      "link": "/docs/internals/builtins/class/get_declared_classes"
                    },
                    {
                      "text": "Get Declared Interfaces",
                      "link": "/docs/internals/builtins/class/get_declared_interfaces"
                    },
                    {
                      "text": "Get Declared Traits",
                      "link": "/docs/internals/builtins/class/get_declared_traits"
                    },
                    {
                      "text": "Get Parent Class",
                      "link": "/docs/internals/builtins/class/get_parent_class"
                    },
                    {
                      "text": "Interface Exists",
                      "link": "/docs/internals/builtins/class/interface_exists"
                    },
                    {
                      "text": "Is A",
                      "link": "/docs/internals/builtins/class/is_a"
                    },
                    {
                      "text": "Is Subclass Of",
                      "link": "/docs/internals/builtins/class/is_subclass_of"
                    },
                    {
                      "text": "Trait Exists",
                      "link": "/docs/internals/builtins/class/trait_exists"
                    }
                  ]
                },
                {
                  "text": "Date",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Checkdate",
                      "link": "/docs/internals/builtins/date/checkdate"
                    },
                    {
                      "text": "Date",
                      "link": "/docs/internals/builtins/date/date"
                    },
                    {
                      "text": "Date Default Timezone Get",
                      "link": "/docs/internals/builtins/date/date_default_timezone_get"
                    },
                    {
                      "text": "Date Default Timezone Set",
                      "link": "/docs/internals/builtins/date/date_default_timezone_set"
                    },
                    {
                      "text": "Getdate",
                      "link": "/docs/internals/builtins/date/getdate"
                    },
                    {
                      "text": "Gmdate",
                      "link": "/docs/internals/builtins/date/gmdate"
                    },
                    {
                      "text": "Gmmktime",
                      "link": "/docs/internals/builtins/date/gmmktime"
                    },
                    {
                      "text": "Hrtime",
                      "link": "/docs/internals/builtins/date/hrtime"
                    },
                    {
                      "text": "Localtime",
                      "link": "/docs/internals/builtins/date/localtime"
                    },
                    {
                      "text": "Microtime",
                      "link": "/docs/internals/builtins/date/microtime"
                    },
                    {
                      "text": "Mktime",
                      "link": "/docs/internals/builtins/date/mktime"
                    },
                    {
                      "text": "Strtotime",
                      "link": "/docs/internals/builtins/date/strtotime"
                    },
                    {
                      "text": "Time",
                      "link": "/docs/internals/builtins/date/time"
                    }
                  ]
                },
                {
                  "text": "Filesystem",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Basename",
                      "link": "/docs/internals/builtins/filesystem/basename"
                    },
                    {
                      "text": "Chdir",
                      "link": "/docs/internals/builtins/filesystem/chdir"
                    },
                    {
                      "text": "Chgrp",
                      "link": "/docs/internals/builtins/filesystem/chgrp"
                    },
                    {
                      "text": "Chmod",
                      "link": "/docs/internals/builtins/filesystem/chmod"
                    },
                    {
                      "text": "Chown",
                      "link": "/docs/internals/builtins/filesystem/chown"
                    },
                    {
                      "text": "Clearstatcache",
                      "link": "/docs/internals/builtins/filesystem/clearstatcache"
                    },
                    {
                      "text": "Copy",
                      "link": "/docs/internals/builtins/filesystem/copy"
                    },
                    {
                      "text": "Dirname",
                      "link": "/docs/internals/builtins/filesystem/dirname"
                    },
                    {
                      "text": "Disk Free Space",
                      "link": "/docs/internals/builtins/filesystem/disk_free_space"
                    },
                    {
                      "text": "Disk Total Space",
                      "link": "/docs/internals/builtins/filesystem/disk_total_space"
                    },
                    {
                      "text": "File Exists",
                      "link": "/docs/internals/builtins/filesystem/file_exists"
                    },
                    {
                      "text": "Fileatime",
                      "link": "/docs/internals/builtins/filesystem/fileatime"
                    },
                    {
                      "text": "Filectime",
                      "link": "/docs/internals/builtins/filesystem/filectime"
                    },
                    {
                      "text": "Filegroup",
                      "link": "/docs/internals/builtins/filesystem/filegroup"
                    },
                    {
                      "text": "Fileinode",
                      "link": "/docs/internals/builtins/filesystem/fileinode"
                    },
                    {
                      "text": "Filemtime",
                      "link": "/docs/internals/builtins/filesystem/filemtime"
                    },
                    {
                      "text": "Fileowner",
                      "link": "/docs/internals/builtins/filesystem/fileowner"
                    },
                    {
                      "text": "Fileperms",
                      "link": "/docs/internals/builtins/filesystem/fileperms"
                    },
                    {
                      "text": "Filesize",
                      "link": "/docs/internals/builtins/filesystem/filesize"
                    },
                    {
                      "text": "Filetype",
                      "link": "/docs/internals/builtins/filesystem/filetype"
                    },
                    {
                      "text": "Fnmatch",
                      "link": "/docs/internals/builtins/filesystem/fnmatch"
                    },
                    {
                      "text": "Getcwd",
                      "link": "/docs/internals/builtins/filesystem/getcwd"
                    },
                    {
                      "text": "Getenv",
                      "link": "/docs/internals/builtins/filesystem/getenv"
                    },
                    {
                      "text": "Glob",
                      "link": "/docs/internals/builtins/filesystem/glob"
                    },
                    {
                      "text": "Is Dir",
                      "link": "/docs/internals/builtins/filesystem/is_dir"
                    },
                    {
                      "text": "Is Executable",
                      "link": "/docs/internals/builtins/filesystem/is_executable"
                    },
                    {
                      "text": "Is File",
                      "link": "/docs/internals/builtins/filesystem/is_file"
                    },
                    {
                      "text": "Is Link",
                      "link": "/docs/internals/builtins/filesystem/is_link"
                    },
                    {
                      "text": "Is Readable",
                      "link": "/docs/internals/builtins/filesystem/is_readable"
                    },
                    {
                      "text": "Is Writable",
                      "link": "/docs/internals/builtins/filesystem/is_writable"
                    },
                    {
                      "text": "Is Writeable",
                      "link": "/docs/internals/builtins/filesystem/is_writeable"
                    },
                    {
                      "text": "Lchgrp",
                      "link": "/docs/internals/builtins/filesystem/lchgrp"
                    },
                    {
                      "text": "Lchown",
                      "link": "/docs/internals/builtins/filesystem/lchown"
                    },
                    {
                      "text": "Link",
                      "link": "/docs/internals/builtins/filesystem/link"
                    },
                    {
                      "text": "Linkinfo",
                      "link": "/docs/internals/builtins/filesystem/linkinfo"
                    },
                    {
                      "text": "Lstat",
                      "link": "/docs/internals/builtins/filesystem/lstat"
                    },
                    {
                      "text": "Mkdir",
                      "link": "/docs/internals/builtins/filesystem/mkdir"
                    },
                    {
                      "text": "Pathinfo",
                      "link": "/docs/internals/builtins/filesystem/pathinfo"
                    },
                    {
                      "text": "Putenv",
                      "link": "/docs/internals/builtins/filesystem/putenv"
                    },
                    {
                      "text": "Readfile",
                      "link": "/docs/internals/builtins/filesystem/readfile"
                    },
                    {
                      "text": "Readlink",
                      "link": "/docs/internals/builtins/filesystem/readlink"
                    },
                    {
                      "text": "Realpath",
                      "link": "/docs/internals/builtins/filesystem/realpath"
                    },
                    {
                      "text": "Realpath Cache Get",
                      "link": "/docs/internals/builtins/filesystem/realpath_cache_get"
                    },
                    {
                      "text": "Realpath Cache Size",
                      "link": "/docs/internals/builtins/filesystem/realpath_cache_size"
                    },
                    {
                      "text": "Rename",
                      "link": "/docs/internals/builtins/filesystem/rename"
                    },
                    {
                      "text": "Rmdir",
                      "link": "/docs/internals/builtins/filesystem/rmdir"
                    },
                    {
                      "text": "Scandir",
                      "link": "/docs/internals/builtins/filesystem/scandir"
                    },
                    {
                      "text": "Stat",
                      "link": "/docs/internals/builtins/filesystem/stat"
                    },
                    {
                      "text": "Symlink",
                      "link": "/docs/internals/builtins/filesystem/symlink"
                    },
                    {
                      "text": "Sys Get Temp Dir",
                      "link": "/docs/internals/builtins/filesystem/sys_get_temp_dir"
                    },
                    {
                      "text": "Tempnam",
                      "link": "/docs/internals/builtins/filesystem/tempnam"
                    },
                    {
                      "text": "Tmpfile",
                      "link": "/docs/internals/builtins/filesystem/tmpfile"
                    },
                    {
                      "text": "Touch",
                      "link": "/docs/internals/builtins/filesystem/touch"
                    },
                    {
                      "text": "Umask",
                      "link": "/docs/internals/builtins/filesystem/umask"
                    },
                    {
                      "text": "Unlink",
                      "link": "/docs/internals/builtins/filesystem/unlink"
                    }
                  ]
                },
                {
                  "text": "Io",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Closedir",
                      "link": "/docs/internals/builtins/io/closedir"
                    },
                    {
                      "text": "Fclose",
                      "link": "/docs/internals/builtins/io/fclose"
                    },
                    {
                      "text": "Fdatasync",
                      "link": "/docs/internals/builtins/io/fdatasync"
                    },
                    {
                      "text": "Feof",
                      "link": "/docs/internals/builtins/io/feof"
                    },
                    {
                      "text": "Fflush",
                      "link": "/docs/internals/builtins/io/fflush"
                    },
                    {
                      "text": "Fgetc",
                      "link": "/docs/internals/builtins/io/fgetc"
                    },
                    {
                      "text": "Fgetcsv",
                      "link": "/docs/internals/builtins/io/fgetcsv"
                    },
                    {
                      "text": "Fgets",
                      "link": "/docs/internals/builtins/io/fgets"
                    },
                    {
                      "text": "File",
                      "link": "/docs/internals/builtins/io/file"
                    },
                    {
                      "text": "File Get Contents",
                      "link": "/docs/internals/builtins/io/file_get_contents"
                    },
                    {
                      "text": "File Put Contents",
                      "link": "/docs/internals/builtins/io/file_put_contents"
                    },
                    {
                      "text": "Flock",
                      "link": "/docs/internals/builtins/io/flock"
                    },
                    {
                      "text": "Fopen",
                      "link": "/docs/internals/builtins/io/fopen"
                    },
                    {
                      "text": "Fpassthru",
                      "link": "/docs/internals/builtins/io/fpassthru"
                    },
                    {
                      "text": "Fprintf",
                      "link": "/docs/internals/builtins/io/fprintf"
                    },
                    {
                      "text": "Fputcsv",
                      "link": "/docs/internals/builtins/io/fputcsv"
                    },
                    {
                      "text": "Fread",
                      "link": "/docs/internals/builtins/io/fread"
                    },
                    {
                      "text": "Fscanf",
                      "link": "/docs/internals/builtins/io/fscanf"
                    },
                    {
                      "text": "Fseek",
                      "link": "/docs/internals/builtins/io/fseek"
                    },
                    {
                      "text": "Fstat",
                      "link": "/docs/internals/builtins/io/fstat"
                    },
                    {
                      "text": "Fsync",
                      "link": "/docs/internals/builtins/io/fsync"
                    },
                    {
                      "text": "Ftell",
                      "link": "/docs/internals/builtins/io/ftell"
                    },
                    {
                      "text": "Ftruncate",
                      "link": "/docs/internals/builtins/io/ftruncate"
                    },
                    {
                      "text": "Fwrite",
                      "link": "/docs/internals/builtins/io/fwrite"
                    },
                    {
                      "text": "Gethostbyaddr",
                      "link": "/docs/internals/builtins/io/gethostbyaddr"
                    },
                    {
                      "text": "Gethostbyname",
                      "link": "/docs/internals/builtins/io/gethostbyname"
                    },
                    {
                      "text": "Gethostname",
                      "link": "/docs/internals/builtins/io/gethostname"
                    },
                    {
                      "text": "Getprotobyname",
                      "link": "/docs/internals/builtins/io/getprotobyname"
                    },
                    {
                      "text": "Getprotobynumber",
                      "link": "/docs/internals/builtins/io/getprotobynumber"
                    },
                    {
                      "text": "Getservbyname",
                      "link": "/docs/internals/builtins/io/getservbyname"
                    },
                    {
                      "text": "Getservbyport",
                      "link": "/docs/internals/builtins/io/getservbyport"
                    },
                    {
                      "text": "Hash File",
                      "link": "/docs/internals/builtins/io/hash_file"
                    },
                    {
                      "text": "Opendir",
                      "link": "/docs/internals/builtins/io/opendir"
                    },
                    {
                      "text": "Readdir",
                      "link": "/docs/internals/builtins/io/readdir"
                    },
                    {
                      "text": "Rewind",
                      "link": "/docs/internals/builtins/io/rewind"
                    },
                    {
                      "text": "Rewinddir",
                      "link": "/docs/internals/builtins/io/rewinddir"
                    },
                    {
                      "text": "Stream Bucket Make Writeable",
                      "link": "/docs/internals/builtins/io/stream_bucket_make_writeable"
                    },
                    {
                      "text": "Stream Bucket New",
                      "link": "/docs/internals/builtins/io/stream_bucket_new"
                    },
                    {
                      "text": "Stream Context Create",
                      "link": "/docs/internals/builtins/io/stream_context_create"
                    },
                    {
                      "text": "Stream Context Get Default",
                      "link": "/docs/internals/builtins/io/stream_context_get_default"
                    },
                    {
                      "text": "Stream Context Get Options",
                      "link": "/docs/internals/builtins/io/stream_context_get_options"
                    },
                    {
                      "text": "Stream Context Get Params",
                      "link": "/docs/internals/builtins/io/stream_context_get_params"
                    },
                    {
                      "text": "Stream Context Set Default",
                      "link": "/docs/internals/builtins/io/stream_context_set_default"
                    },
                    {
                      "text": "Stream Context Set Option",
                      "link": "/docs/internals/builtins/io/stream_context_set_option"
                    },
                    {
                      "text": "Stream Context Set Params",
                      "link": "/docs/internals/builtins/io/stream_context_set_params"
                    },
                    {
                      "text": "Stream Copy To Stream",
                      "link": "/docs/internals/builtins/io/stream_copy_to_stream"
                    },
                    {
                      "text": "Stream Filter Register",
                      "link": "/docs/internals/builtins/io/stream_filter_register"
                    },
                    {
                      "text": "Stream Filter Remove",
                      "link": "/docs/internals/builtins/io/stream_filter_remove"
                    },
                    {
                      "text": "Stream Get Contents",
                      "link": "/docs/internals/builtins/io/stream_get_contents"
                    },
                    {
                      "text": "Stream Get Filters",
                      "link": "/docs/internals/builtins/io/stream_get_filters"
                    },
                    {
                      "text": "Stream Get Line",
                      "link": "/docs/internals/builtins/io/stream_get_line"
                    },
                    {
                      "text": "Stream Get Meta Data",
                      "link": "/docs/internals/builtins/io/stream_get_meta_data"
                    },
                    {
                      "text": "Stream Get Transports",
                      "link": "/docs/internals/builtins/io/stream_get_transports"
                    },
                    {
                      "text": "Stream Get Wrappers",
                      "link": "/docs/internals/builtins/io/stream_get_wrappers"
                    },
                    {
                      "text": "Stream Is Local",
                      "link": "/docs/internals/builtins/io/stream_is_local"
                    },
                    {
                      "text": "Stream Isatty",
                      "link": "/docs/internals/builtins/io/stream_isatty"
                    },
                    {
                      "text": "Stream Resolve Include Path",
                      "link": "/docs/internals/builtins/io/stream_resolve_include_path"
                    },
                    {
                      "text": "Stream Select",
                      "link": "/docs/internals/builtins/io/stream_select"
                    },
                    {
                      "text": "Stream Set Blocking",
                      "link": "/docs/internals/builtins/io/stream_set_blocking"
                    },
                    {
                      "text": "Stream Set Chunk Size",
                      "link": "/docs/internals/builtins/io/stream_set_chunk_size"
                    },
                    {
                      "text": "Stream Set Read Buffer",
                      "link": "/docs/internals/builtins/io/stream_set_read_buffer"
                    },
                    {
                      "text": "Stream Set Timeout",
                      "link": "/docs/internals/builtins/io/stream_set_timeout"
                    },
                    {
                      "text": "Stream Set Write Buffer",
                      "link": "/docs/internals/builtins/io/stream_set_write_buffer"
                    },
                    {
                      "text": "Stream Socket Accept",
                      "link": "/docs/internals/builtins/io/stream_socket_accept"
                    },
                    {
                      "text": "Stream Socket Client",
                      "link": "/docs/internals/builtins/io/stream_socket_client"
                    },
                    {
                      "text": "Stream Socket Enable Crypto",
                      "link": "/docs/internals/builtins/io/stream_socket_enable_crypto"
                    },
                    {
                      "text": "Stream Socket Get Name",
                      "link": "/docs/internals/builtins/io/stream_socket_get_name"
                    },
                    {
                      "text": "Stream Socket Pair",
                      "link": "/docs/internals/builtins/io/stream_socket_pair"
                    },
                    {
                      "text": "Stream Socket Recvfrom",
                      "link": "/docs/internals/builtins/io/stream_socket_recvfrom"
                    },
                    {
                      "text": "Stream Socket Sendto",
                      "link": "/docs/internals/builtins/io/stream_socket_sendto"
                    },
                    {
                      "text": "Stream Socket Server",
                      "link": "/docs/internals/builtins/io/stream_socket_server"
                    },
                    {
                      "text": "Stream Socket Shutdown",
                      "link": "/docs/internals/builtins/io/stream_socket_shutdown"
                    },
                    {
                      "text": "Stream Supports Lock",
                      "link": "/docs/internals/builtins/io/stream_supports_lock"
                    },
                    {
                      "text": "Stream Wrapper Register",
                      "link": "/docs/internals/builtins/io/stream_wrapper_register"
                    },
                    {
                      "text": "Stream Wrapper Restore",
                      "link": "/docs/internals/builtins/io/stream_wrapper_restore"
                    },
                    {
                      "text": "Stream Wrapper Unregister",
                      "link": "/docs/internals/builtins/io/stream_wrapper_unregister"
                    },
                    {
                      "text": "Vfprintf",
                      "link": "/docs/internals/builtins/io/vfprintf"
                    }
                  ]
                },
                {
                  "text": "Json",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Json Decode",
                      "link": "/docs/internals/builtins/json/json_decode"
                    },
                    {
                      "text": "Json Encode",
                      "link": "/docs/internals/builtins/json/json_encode"
                    },
                    {
                      "text": "Json Last Error",
                      "link": "/docs/internals/builtins/json/json_last_error"
                    },
                    {
                      "text": "Json Last Error Msg",
                      "link": "/docs/internals/builtins/json/json_last_error_msg"
                    },
                    {
                      "text": "Json Validate",
                      "link": "/docs/internals/builtins/json/json_validate"
                    }
                  ]
                },
                {
                  "text": "Math",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Abs",
                      "link": "/docs/internals/builtins/math/abs"
                    },
                    {
                      "text": "Acos",
                      "link": "/docs/internals/builtins/math/acos"
                    },
                    {
                      "text": "Asin",
                      "link": "/docs/internals/builtins/math/asin"
                    },
                    {
                      "text": "Atan",
                      "link": "/docs/internals/builtins/math/atan"
                    },
                    {
                      "text": "Atan2",
                      "link": "/docs/internals/builtins/math/atan2"
                    },
                    {
                      "text": "Ceil",
                      "link": "/docs/internals/builtins/math/ceil"
                    },
                    {
                      "text": "Clamp",
                      "link": "/docs/internals/builtins/math/clamp"
                    },
                    {
                      "text": "Cos",
                      "link": "/docs/internals/builtins/math/cos"
                    },
                    {
                      "text": "Cosh",
                      "link": "/docs/internals/builtins/math/cosh"
                    },
                    {
                      "text": "Deg2rad",
                      "link": "/docs/internals/builtins/math/deg2rad"
                    },
                    {
                      "text": "Exp",
                      "link": "/docs/internals/builtins/math/exp"
                    },
                    {
                      "text": "Fdiv",
                      "link": "/docs/internals/builtins/math/fdiv"
                    },
                    {
                      "text": "Floor",
                      "link": "/docs/internals/builtins/math/floor"
                    },
                    {
                      "text": "Fmod",
                      "link": "/docs/internals/builtins/math/fmod"
                    },
                    {
                      "text": "Hypot",
                      "link": "/docs/internals/builtins/math/hypot"
                    },
                    {
                      "text": "Intdiv",
                      "link": "/docs/internals/builtins/math/intdiv"
                    },
                    {
                      "text": "Is Finite",
                      "link": "/docs/internals/builtins/math/is_finite"
                    },
                    {
                      "text": "Is Infinite",
                      "link": "/docs/internals/builtins/math/is_infinite"
                    },
                    {
                      "text": "Is Nan",
                      "link": "/docs/internals/builtins/math/is_nan"
                    },
                    {
                      "text": "Log",
                      "link": "/docs/internals/builtins/math/log"
                    },
                    {
                      "text": "Log10",
                      "link": "/docs/internals/builtins/math/log10"
                    },
                    {
                      "text": "Log2",
                      "link": "/docs/internals/builtins/math/log2"
                    },
                    {
                      "text": "Max",
                      "link": "/docs/internals/builtins/math/max"
                    },
                    {
                      "text": "Min",
                      "link": "/docs/internals/builtins/math/min"
                    },
                    {
                      "text": "Mt Rand",
                      "link": "/docs/internals/builtins/math/mt_rand"
                    },
                    {
                      "text": "Pi",
                      "link": "/docs/internals/builtins/math/pi"
                    },
                    {
                      "text": "Pow",
                      "link": "/docs/internals/builtins/math/pow"
                    },
                    {
                      "text": "Rad2deg",
                      "link": "/docs/internals/builtins/math/rad2deg"
                    },
                    {
                      "text": "Rand",
                      "link": "/docs/internals/builtins/math/rand"
                    },
                    {
                      "text": "Random Int",
                      "link": "/docs/internals/builtins/math/random_int"
                    },
                    {
                      "text": "Round",
                      "link": "/docs/internals/builtins/math/round"
                    },
                    {
                      "text": "Sin",
                      "link": "/docs/internals/builtins/math/sin"
                    },
                    {
                      "text": "Sinh",
                      "link": "/docs/internals/builtins/math/sinh"
                    },
                    {
                      "text": "Sqrt",
                      "link": "/docs/internals/builtins/math/sqrt"
                    },
                    {
                      "text": "Tan",
                      "link": "/docs/internals/builtins/math/tan"
                    },
                    {
                      "text": "Tanh",
                      "link": "/docs/internals/builtins/math/tanh"
                    }
                  ]
                },
                {
                  "text": "Misc",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Buffer New",
                      "link": "/docs/internals/builtins/misc/buffer_new"
                    },
                    {
                      "text": "Call User Func",
                      "link": "/docs/internals/builtins/misc/call_user_func"
                    },
                    {
                      "text": "Call User Func Array",
                      "link": "/docs/internals/builtins/misc/call_user_func_array"
                    },
                    {
                      "text": "Define",
                      "link": "/docs/internals/builtins/misc/define"
                    },
                    {
                      "text": "Defined",
                      "link": "/docs/internals/builtins/misc/defined"
                    },
                    {
                      "text": "Empty",
                      "link": "/docs/internals/builtins/misc/empty"
                    },
                    {
                      "text": "Header",
                      "link": "/docs/internals/builtins/misc/header"
                    },
                    {
                      "text": "Http Response Code",
                      "link": "/docs/internals/builtins/misc/http_response_code"
                    },
                    {
                      "text": "Isset",
                      "link": "/docs/internals/builtins/misc/isset"
                    },
                    {
                      "text": "Php Uname",
                      "link": "/docs/internals/builtins/misc/php_uname"
                    },
                    {
                      "text": "Phpversion",
                      "link": "/docs/internals/builtins/misc/phpversion"
                    },
                    {
                      "text": "Print R",
                      "link": "/docs/internals/builtins/misc/print_r"
                    },
                    {
                      "text": "Serialize",
                      "link": "/docs/internals/builtins/misc/serialize"
                    },
                    {
                      "text": "Unserialize",
                      "link": "/docs/internals/builtins/misc/unserialize"
                    },
                    {
                      "text": "Unset",
                      "link": "/docs/internals/builtins/misc/unset"
                    },
                    {
                      "text": "Var Dump",
                      "link": "/docs/internals/builtins/misc/var_dump"
                    }
                  ]
                },
                {
                  "text": "Pointer",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Ptr",
                      "link": "/docs/internals/builtins/pointer/ptr"
                    },
                    {
                      "text": "Ptr Get",
                      "link": "/docs/internals/builtins/pointer/ptr_get"
                    },
                    {
                      "text": "Ptr Is Null",
                      "link": "/docs/internals/builtins/pointer/ptr_is_null"
                    },
                    {
                      "text": "Ptr Null",
                      "link": "/docs/internals/builtins/pointer/ptr_null"
                    },
                    {
                      "text": "Ptr Offset",
                      "link": "/docs/internals/builtins/pointer/ptr_offset"
                    },
                    {
                      "text": "Ptr Read String",
                      "link": "/docs/internals/builtins/pointer/ptr_read_string"
                    },
                    {
                      "text": "Ptr Read16",
                      "link": "/docs/internals/builtins/pointer/ptr_read16"
                    },
                    {
                      "text": "Ptr Read32",
                      "link": "/docs/internals/builtins/pointer/ptr_read32"
                    },
                    {
                      "text": "Ptr Read8",
                      "link": "/docs/internals/builtins/pointer/ptr_read8"
                    },
                    {
                      "text": "Ptr Set",
                      "link": "/docs/internals/builtins/pointer/ptr_set"
                    },
                    {
                      "text": "Ptr Sizeof",
                      "link": "/docs/internals/builtins/pointer/ptr_sizeof"
                    },
                    {
                      "text": "Ptr Write String",
                      "link": "/docs/internals/builtins/pointer/ptr_write_string"
                    },
                    {
                      "text": "Ptr Write16",
                      "link": "/docs/internals/builtins/pointer/ptr_write16"
                    },
                    {
                      "text": "Ptr Write32",
                      "link": "/docs/internals/builtins/pointer/ptr_write32"
                    },
                    {
                      "text": "Ptr Write8",
                      "link": "/docs/internals/builtins/pointer/ptr_write8"
                    }
                  ]
                },
                {
                  "text": "Process",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Die",
                      "link": "/docs/internals/builtins/process/die"
                    },
                    {
                      "text": "Exec",
                      "link": "/docs/internals/builtins/process/exec"
                    },
                    {
                      "text": "Exit",
                      "link": "/docs/internals/builtins/process/exit"
                    },
                    {
                      "text": "Passthru",
                      "link": "/docs/internals/builtins/process/passthru"
                    },
                    {
                      "text": "Pclose",
                      "link": "/docs/internals/builtins/process/pclose"
                    },
                    {
                      "text": "Popen",
                      "link": "/docs/internals/builtins/process/popen"
                    },
                    {
                      "text": "Readline",
                      "link": "/docs/internals/builtins/process/readline"
                    },
                    {
                      "text": "Shell Exec",
                      "link": "/docs/internals/builtins/process/shell_exec"
                    },
                    {
                      "text": "Sleep",
                      "link": "/docs/internals/builtins/process/sleep"
                    },
                    {
                      "text": "System",
                      "link": "/docs/internals/builtins/process/system"
                    },
                    {
                      "text": "Usleep",
                      "link": "/docs/internals/builtins/process/usleep"
                    }
                  ]
                },
                {
                  "text": "Regex",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Preg Match",
                      "link": "/docs/internals/builtins/regex/preg_match"
                    },
                    {
                      "text": "Preg Match All",
                      "link": "/docs/internals/builtins/regex/preg_match_all"
                    },
                    {
                      "text": "Preg Replace",
                      "link": "/docs/internals/builtins/regex/preg_replace"
                    },
                    {
                      "text": "Preg Replace Callback",
                      "link": "/docs/internals/builtins/regex/preg_replace_callback"
                    },
                    {
                      "text": "Preg Split",
                      "link": "/docs/internals/builtins/regex/preg_split"
                    }
                  ]
                },
                {
                  "text": "Spl",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Iterator Apply",
                      "link": "/docs/internals/builtins/spl/iterator_apply"
                    },
                    {
                      "text": "Iterator Count",
                      "link": "/docs/internals/builtins/spl/iterator_count"
                    },
                    {
                      "text": "Iterator To Array",
                      "link": "/docs/internals/builtins/spl/iterator_to_array"
                    },
                    {
                      "text": "Spl Autoload",
                      "link": "/docs/internals/builtins/spl/spl_autoload"
                    },
                    {
                      "text": "Spl Autoload Call",
                      "link": "/docs/internals/builtins/spl/spl_autoload_call"
                    },
                    {
                      "text": "Spl Autoload Extensions",
                      "link": "/docs/internals/builtins/spl/spl_autoload_extensions"
                    },
                    {
                      "text": "Spl Autoload Functions",
                      "link": "/docs/internals/builtins/spl/spl_autoload_functions"
                    },
                    {
                      "text": "Spl Autoload Register",
                      "link": "/docs/internals/builtins/spl/spl_autoload_register"
                    },
                    {
                      "text": "Spl Autoload Unregister",
                      "link": "/docs/internals/builtins/spl/spl_autoload_unregister"
                    },
                    {
                      "text": "Spl Classes",
                      "link": "/docs/internals/builtins/spl/spl_classes"
                    },
                    {
                      "text": "Spl Object Hash",
                      "link": "/docs/internals/builtins/spl/spl_object_hash"
                    },
                    {
                      "text": "Spl Object Id",
                      "link": "/docs/internals/builtins/spl/spl_object_id"
                    }
                  ]
                },
                {
                  "text": "Streams",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Fsockopen",
                      "link": "/docs/internals/builtins/streams/fsockopen"
                    },
                    {
                      "text": "Pfsockopen",
                      "link": "/docs/internals/builtins/streams/pfsockopen"
                    },
                    {
                      "text": "Stream Bucket Append",
                      "link": "/docs/internals/builtins/streams/stream_bucket_append"
                    },
                    {
                      "text": "Stream Bucket Prepend",
                      "link": "/docs/internals/builtins/streams/stream_bucket_prepend"
                    },
                    {
                      "text": "Stream Filter Append",
                      "link": "/docs/internals/builtins/streams/stream_filter_append"
                    },
                    {
                      "text": "Stream Filter Prepend",
                      "link": "/docs/internals/builtins/streams/stream_filter_prepend"
                    }
                  ]
                },
                {
                  "text": "String",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Addslashes",
                      "link": "/docs/internals/builtins/string/addslashes"
                    },
                    {
                      "text": "Base64 Decode",
                      "link": "/docs/internals/builtins/string/base64_decode"
                    },
                    {
                      "text": "Base64 Encode",
                      "link": "/docs/internals/builtins/string/base64_encode"
                    },
                    {
                      "text": "Bin2hex",
                      "link": "/docs/internals/builtins/string/bin2hex"
                    },
                    {
                      "text": "Chop",
                      "link": "/docs/internals/builtins/string/chop"
                    },
                    {
                      "text": "Chr",
                      "link": "/docs/internals/builtins/string/chr"
                    },
                    {
                      "text": "Crc32",
                      "link": "/docs/internals/builtins/string/crc32"
                    },
                    {
                      "text": "Explode",
                      "link": "/docs/internals/builtins/string/explode"
                    },
                    {
                      "text": "Grapheme Strrev",
                      "link": "/docs/internals/builtins/string/grapheme_strrev"
                    },
                    {
                      "text": "Gzcompress",
                      "link": "/docs/internals/builtins/string/gzcompress"
                    },
                    {
                      "text": "Gzdeflate",
                      "link": "/docs/internals/builtins/string/gzdeflate"
                    },
                    {
                      "text": "Gzinflate",
                      "link": "/docs/internals/builtins/string/gzinflate"
                    },
                    {
                      "text": "Gzuncompress",
                      "link": "/docs/internals/builtins/string/gzuncompress"
                    },
                    {
                      "text": "Hash",
                      "link": "/docs/internals/builtins/string/hash"
                    },
                    {
                      "text": "Hash Algos",
                      "link": "/docs/internals/builtins/string/hash_algos"
                    },
                    {
                      "text": "Hash Copy",
                      "link": "/docs/internals/builtins/string/hash_copy"
                    },
                    {
                      "text": "Hash Equals",
                      "link": "/docs/internals/builtins/string/hash_equals"
                    },
                    {
                      "text": "Hash Final",
                      "link": "/docs/internals/builtins/string/hash_final"
                    },
                    {
                      "text": "Hash Hmac",
                      "link": "/docs/internals/builtins/string/hash_hmac"
                    },
                    {
                      "text": "Hash Init",
                      "link": "/docs/internals/builtins/string/hash_init"
                    },
                    {
                      "text": "Hash Update",
                      "link": "/docs/internals/builtins/string/hash_update"
                    },
                    {
                      "text": "Hex2bin",
                      "link": "/docs/internals/builtins/string/hex2bin"
                    },
                    {
                      "text": "Html Entity Decode",
                      "link": "/docs/internals/builtins/string/html_entity_decode"
                    },
                    {
                      "text": "Htmlentities",
                      "link": "/docs/internals/builtins/string/htmlentities"
                    },
                    {
                      "text": "Htmlspecialchars",
                      "link": "/docs/internals/builtins/string/htmlspecialchars"
                    },
                    {
                      "text": "Implode",
                      "link": "/docs/internals/builtins/string/implode"
                    },
                    {
                      "text": "Inet Ntop",
                      "link": "/docs/internals/builtins/string/inet_ntop"
                    },
                    {
                      "text": "Inet Pton",
                      "link": "/docs/internals/builtins/string/inet_pton"
                    },
                    {
                      "text": "Ip2long",
                      "link": "/docs/internals/builtins/string/ip2long"
                    },
                    {
                      "text": "Lcfirst",
                      "link": "/docs/internals/builtins/string/lcfirst"
                    },
                    {
                      "text": "Long2ip",
                      "link": "/docs/internals/builtins/string/long2ip"
                    },
                    {
                      "text": "Ltrim",
                      "link": "/docs/internals/builtins/string/ltrim"
                    },
                    {
                      "text": "Md5",
                      "link": "/docs/internals/builtins/string/md5"
                    },
                    {
                      "text": "Nl2br",
                      "link": "/docs/internals/builtins/string/nl2br"
                    },
                    {
                      "text": "Number Format",
                      "link": "/docs/internals/builtins/string/number_format"
                    },
                    {
                      "text": "Ord",
                      "link": "/docs/internals/builtins/string/ord"
                    },
                    {
                      "text": "Printf",
                      "link": "/docs/internals/builtins/string/printf"
                    },
                    {
                      "text": "Rawurldecode",
                      "link": "/docs/internals/builtins/string/rawurldecode"
                    },
                    {
                      "text": "Rawurlencode",
                      "link": "/docs/internals/builtins/string/rawurlencode"
                    },
                    {
                      "text": "Rtrim",
                      "link": "/docs/internals/builtins/string/rtrim"
                    },
                    {
                      "text": "Sha1",
                      "link": "/docs/internals/builtins/string/sha1"
                    },
                    {
                      "text": "Sprintf",
                      "link": "/docs/internals/builtins/string/sprintf"
                    },
                    {
                      "text": "Sscanf",
                      "link": "/docs/internals/builtins/string/sscanf"
                    },
                    {
                      "text": "Str Contains",
                      "link": "/docs/internals/builtins/string/str_contains"
                    },
                    {
                      "text": "Str Ends With",
                      "link": "/docs/internals/builtins/string/str_ends_with"
                    },
                    {
                      "text": "Str Ireplace",
                      "link": "/docs/internals/builtins/string/str_ireplace"
                    },
                    {
                      "text": "Str Pad",
                      "link": "/docs/internals/builtins/string/str_pad"
                    },
                    {
                      "text": "Str Repeat",
                      "link": "/docs/internals/builtins/string/str_repeat"
                    },
                    {
                      "text": "Str Replace",
                      "link": "/docs/internals/builtins/string/str_replace"
                    },
                    {
                      "text": "Str Split",
                      "link": "/docs/internals/builtins/string/str_split"
                    },
                    {
                      "text": "Str Starts With",
                      "link": "/docs/internals/builtins/string/str_starts_with"
                    },
                    {
                      "text": "Strcasecmp",
                      "link": "/docs/internals/builtins/string/strcasecmp"
                    },
                    {
                      "text": "Strcmp",
                      "link": "/docs/internals/builtins/string/strcmp"
                    },
                    {
                      "text": "Stripslashes",
                      "link": "/docs/internals/builtins/string/stripslashes"
                    },
                    {
                      "text": "Strlen",
                      "link": "/docs/internals/builtins/string/strlen"
                    },
                    {
                      "text": "Strpos",
                      "link": "/docs/internals/builtins/string/strpos"
                    },
                    {
                      "text": "Strrev",
                      "link": "/docs/internals/builtins/string/strrev"
                    },
                    {
                      "text": "Strrpos",
                      "link": "/docs/internals/builtins/string/strrpos"
                    },
                    {
                      "text": "Strstr",
                      "link": "/docs/internals/builtins/string/strstr"
                    },
                    {
                      "text": "Strtolower",
                      "link": "/docs/internals/builtins/string/strtolower"
                    },
                    {
                      "text": "Strtoupper",
                      "link": "/docs/internals/builtins/string/strtoupper"
                    },
                    {
                      "text": "Substr",
                      "link": "/docs/internals/builtins/string/substr"
                    },
                    {
                      "text": "Substr Replace",
                      "link": "/docs/internals/builtins/string/substr_replace"
                    },
                    {
                      "text": "Trim",
                      "link": "/docs/internals/builtins/string/trim"
                    },
                    {
                      "text": "Ucfirst",
                      "link": "/docs/internals/builtins/string/ucfirst"
                    },
                    {
                      "text": "Ucwords",
                      "link": "/docs/internals/builtins/string/ucwords"
                    },
                    {
                      "text": "Urldecode",
                      "link": "/docs/internals/builtins/string/urldecode"
                    },
                    {
                      "text": "Urlencode",
                      "link": "/docs/internals/builtins/string/urlencode"
                    },
                    {
                      "text": "Vprintf",
                      "link": "/docs/internals/builtins/string/vprintf"
                    },
                    {
                      "text": "Vsprintf",
                      "link": "/docs/internals/builtins/string/vsprintf"
                    },
                    {
                      "text": "Wordwrap",
                      "link": "/docs/internals/builtins/string/wordwrap"
                    }
                  ]
                },
                {
                  "text": "Type",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Boolval",
                      "link": "/docs/internals/builtins/type/boolval"
                    },
                    {
                      "text": "Ctype Alnum",
                      "link": "/docs/internals/builtins/type/ctype_alnum"
                    },
                    {
                      "text": "Ctype Alpha",
                      "link": "/docs/internals/builtins/type/ctype_alpha"
                    },
                    {
                      "text": "Ctype Digit",
                      "link": "/docs/internals/builtins/type/ctype_digit"
                    },
                    {
                      "text": "Ctype Space",
                      "link": "/docs/internals/builtins/type/ctype_space"
                    },
                    {
                      "text": "Floatval",
                      "link": "/docs/internals/builtins/type/floatval"
                    },
                    {
                      "text": "Get Resource Id",
                      "link": "/docs/internals/builtins/type/get_resource_id"
                    },
                    {
                      "text": "Get Resource Type",
                      "link": "/docs/internals/builtins/type/get_resource_type"
                    },
                    {
                      "text": "Gettype",
                      "link": "/docs/internals/builtins/type/gettype"
                    },
                    {
                      "text": "Intval",
                      "link": "/docs/internals/builtins/type/intval"
                    },
                    {
                      "text": "Is Array",
                      "link": "/docs/internals/builtins/type/is_array"
                    },
                    {
                      "text": "Is Bool",
                      "link": "/docs/internals/builtins/type/is_bool"
                    },
                    {
                      "text": "Is Callable",
                      "link": "/docs/internals/builtins/type/is_callable"
                    },
                    {
                      "text": "Is Float",
                      "link": "/docs/internals/builtins/type/is_float"
                    },
                    {
                      "text": "Is Int",
                      "link": "/docs/internals/builtins/type/is_int"
                    },
                    {
                      "text": "Is Iterable",
                      "link": "/docs/internals/builtins/type/is_iterable"
                    },
                    {
                      "text": "Is Null",
                      "link": "/docs/internals/builtins/type/is_null"
                    },
                    {
                      "text": "Is Numeric",
                      "link": "/docs/internals/builtins/type/is_numeric"
                    },
                    {
                      "text": "Is Object",
                      "link": "/docs/internals/builtins/type/is_object"
                    },
                    {
                      "text": "Is Resource",
                      "link": "/docs/internals/builtins/type/is_resource"
                    },
                    {
                      "text": "Is Scalar",
                      "link": "/docs/internals/builtins/type/is_scalar"
                    },
                    {
                      "text": "Is String",
                      "link": "/docs/internals/builtins/type/is_string"
                    },
                    {
                      "text": "Settype",
                      "link": "/docs/internals/builtins/type/settype"
                    }
                  ]
                }
              ]
            },
            {
              "text": "How Elephc Works",
              "link": "/docs/internals/how-elephc-works"
            },
            {
              "text": "Memory Model",
              "link": "/docs/internals/memory-model"
            },
            {
              "text": "The Codegen",
              "link": "/docs/internals/the-codegen"
            },
            {
              "text": "The Ir",
              "link": "/docs/internals/the-ir"
            },
            {
              "text": "The Lexer",
              "link": "/docs/internals/the-lexer"
            },
            {
              "text": "The Optimizer",
              "link": "/docs/internals/the-optimizer"
            },
            {
              "text": "The Parser",
              "link": "/docs/internals/the-parser"
            },
            {
              "text": "The Runtime",
              "link": "/docs/internals/the-runtime"
            },
            {
              "text": "The Type Checker",
              "link": "/docs/internals/the-type-checker"
            },
            {
              "text": "What Is A Compiler",
              "link": "/docs/internals/what-is-a-compiler"
            }
          ]
        },
        {
          "text": "Php",
          "collapsed": true,
          "items": [
            {
              "text": "Arrays",
              "link": "/docs/php/arrays"
            },
            {
              "text": "Builtins",
              "collapsed": true,
              "items": [
                {
                  "text": "Array",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Array All",
                      "link": "/docs/php/builtins/array/array_all"
                    },
                    {
                      "text": "Array Any",
                      "link": "/docs/php/builtins/array/array_any"
                    },
                    {
                      "text": "Array Chunk",
                      "link": "/docs/php/builtins/array/array_chunk"
                    },
                    {
                      "text": "Array Column",
                      "link": "/docs/php/builtins/array/array_column"
                    },
                    {
                      "text": "Array Combine",
                      "link": "/docs/php/builtins/array/array_combine"
                    },
                    {
                      "text": "Array Diff",
                      "link": "/docs/php/builtins/array/array_diff"
                    },
                    {
                      "text": "Array Diff Assoc",
                      "link": "/docs/php/builtins/array/array_diff_assoc"
                    },
                    {
                      "text": "Array Diff Key",
                      "link": "/docs/php/builtins/array/array_diff_key"
                    },
                    {
                      "text": "Array Fill",
                      "link": "/docs/php/builtins/array/array_fill"
                    },
                    {
                      "text": "Array Fill Keys",
                      "link": "/docs/php/builtins/array/array_fill_keys"
                    },
                    {
                      "text": "Array Filter",
                      "link": "/docs/php/builtins/array/array_filter"
                    },
                    {
                      "text": "Array Find",
                      "link": "/docs/php/builtins/array/array_find"
                    },
                    {
                      "text": "Array Flip",
                      "link": "/docs/php/builtins/array/array_flip"
                    },
                    {
                      "text": "Array Intersect",
                      "link": "/docs/php/builtins/array/array_intersect"
                    },
                    {
                      "text": "Array Intersect Assoc",
                      "link": "/docs/php/builtins/array/array_intersect_assoc"
                    },
                    {
                      "text": "Array Intersect Key",
                      "link": "/docs/php/builtins/array/array_intersect_key"
                    },
                    {
                      "text": "Array Is List",
                      "link": "/docs/php/builtins/array/array_is_list"
                    },
                    {
                      "text": "Array Key Exists",
                      "link": "/docs/php/builtins/array/array_key_exists"
                    },
                    {
                      "text": "Array Key First",
                      "link": "/docs/php/builtins/array/array_key_first"
                    },
                    {
                      "text": "Array Key Last",
                      "link": "/docs/php/builtins/array/array_key_last"
                    },
                    {
                      "text": "Array Keys",
                      "link": "/docs/php/builtins/array/array_keys"
                    },
                    {
                      "text": "Array Map",
                      "link": "/docs/php/builtins/array/array_map"
                    },
                    {
                      "text": "Array Merge",
                      "link": "/docs/php/builtins/array/array_merge"
                    },
                    {
                      "text": "Array Merge Recursive",
                      "link": "/docs/php/builtins/array/array_merge_recursive"
                    },
                    {
                      "text": "Array Multisort",
                      "link": "/docs/php/builtins/array/array_multisort"
                    },
                    {
                      "text": "Array Pad",
                      "link": "/docs/php/builtins/array/array_pad"
                    },
                    {
                      "text": "Array Pop",
                      "link": "/docs/php/builtins/array/array_pop"
                    },
                    {
                      "text": "Array Product",
                      "link": "/docs/php/builtins/array/array_product"
                    },
                    {
                      "text": "Array Push",
                      "link": "/docs/php/builtins/array/array_push"
                    },
                    {
                      "text": "Array Rand",
                      "link": "/docs/php/builtins/array/array_rand"
                    },
                    {
                      "text": "Array Reduce",
                      "link": "/docs/php/builtins/array/array_reduce"
                    },
                    {
                      "text": "Array Replace",
                      "link": "/docs/php/builtins/array/array_replace"
                    },
                    {
                      "text": "Array Replace Recursive",
                      "link": "/docs/php/builtins/array/array_replace_recursive"
                    },
                    {
                      "text": "Array Reverse",
                      "link": "/docs/php/builtins/array/array_reverse"
                    },
                    {
                      "text": "Array Search",
                      "link": "/docs/php/builtins/array/array_search"
                    },
                    {
                      "text": "Array Shift",
                      "link": "/docs/php/builtins/array/array_shift"
                    },
                    {
                      "text": "Array Slice",
                      "link": "/docs/php/builtins/array/array_slice"
                    },
                    {
                      "text": "Array Splice",
                      "link": "/docs/php/builtins/array/array_splice"
                    },
                    {
                      "text": "Array Sum",
                      "link": "/docs/php/builtins/array/array_sum"
                    },
                    {
                      "text": "Array Udiff",
                      "link": "/docs/php/builtins/array/array_udiff"
                    },
                    {
                      "text": "Array Uintersect",
                      "link": "/docs/php/builtins/array/array_uintersect"
                    },
                    {
                      "text": "Array Unique",
                      "link": "/docs/php/builtins/array/array_unique"
                    },
                    {
                      "text": "Array Unshift",
                      "link": "/docs/php/builtins/array/array_unshift"
                    },
                    {
                      "text": "Array Values",
                      "link": "/docs/php/builtins/array/array_values"
                    },
                    {
                      "text": "Array Walk",
                      "link": "/docs/php/builtins/array/array_walk"
                    },
                    {
                      "text": "Array Walk Recursive",
                      "link": "/docs/php/builtins/array/array_walk_recursive"
                    },
                    {
                      "text": "Arsort",
                      "link": "/docs/php/builtins/array/arsort"
                    },
                    {
                      "text": "Asort",
                      "link": "/docs/php/builtins/array/asort"
                    },
                    {
                      "text": "Count",
                      "link": "/docs/php/builtins/array/count"
                    },
                    {
                      "text": "In Array",
                      "link": "/docs/php/builtins/array/in_array"
                    },
                    {
                      "text": "Krsort",
                      "link": "/docs/php/builtins/array/krsort"
                    },
                    {
                      "text": "Ksort",
                      "link": "/docs/php/builtins/array/ksort"
                    },
                    {
                      "text": "Natcasesort",
                      "link": "/docs/php/builtins/array/natcasesort"
                    },
                    {
                      "text": "Natsort",
                      "link": "/docs/php/builtins/array/natsort"
                    },
                    {
                      "text": "Range",
                      "link": "/docs/php/builtins/array/range"
                    },
                    {
                      "text": "Rsort",
                      "link": "/docs/php/builtins/array/rsort"
                    },
                    {
                      "text": "Shuffle",
                      "link": "/docs/php/builtins/array/shuffle"
                    },
                    {
                      "text": "Sort",
                      "link": "/docs/php/builtins/array/sort"
                    },
                    {
                      "text": "Uasort",
                      "link": "/docs/php/builtins/array/uasort"
                    },
                    {
                      "text": "Uksort",
                      "link": "/docs/php/builtins/array/uksort"
                    },
                    {
                      "text": "Usort",
                      "link": "/docs/php/builtins/array/usort"
                    }
                  ],
                  "link": "/docs/php/builtins/array"
                },
                {
                  "text": "Buffer",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Buffer Free",
                      "link": "/docs/php/builtins/buffer/buffer_free"
                    },
                    {
                      "text": "Buffer Len",
                      "link": "/docs/php/builtins/buffer/buffer_len"
                    }
                  ],
                  "link": "/docs/php/builtins/buffer"
                },
                {
                  "text": "Class",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Class Alias",
                      "link": "/docs/php/builtins/class/class_alias"
                    },
                    {
                      "text": "Class Attribute Args",
                      "link": "/docs/php/builtins/class/class_attribute_args"
                    },
                    {
                      "text": "Class Attribute Names",
                      "link": "/docs/php/builtins/class/class_attribute_names"
                    },
                    {
                      "text": "Class Exists",
                      "link": "/docs/php/builtins/class/class_exists"
                    },
                    {
                      "text": "Class Get Attributes",
                      "link": "/docs/php/builtins/class/class_get_attributes"
                    },
                    {
                      "text": "Class Implements",
                      "link": "/docs/php/builtins/class/class_implements"
                    },
                    {
                      "text": "Class Parents",
                      "link": "/docs/php/builtins/class/class_parents"
                    },
                    {
                      "text": "Class Uses",
                      "link": "/docs/php/builtins/class/class_uses"
                    },
                    {
                      "text": "Enum Exists",
                      "link": "/docs/php/builtins/class/enum_exists"
                    },
                    {
                      "text": "Function Exists",
                      "link": "/docs/php/builtins/class/function_exists"
                    },
                    {
                      "text": "Get Class",
                      "link": "/docs/php/builtins/class/get_class"
                    },
                    {
                      "text": "Get Declared Classes",
                      "link": "/docs/php/builtins/class/get_declared_classes"
                    },
                    {
                      "text": "Get Declared Interfaces",
                      "link": "/docs/php/builtins/class/get_declared_interfaces"
                    },
                    {
                      "text": "Get Declared Traits",
                      "link": "/docs/php/builtins/class/get_declared_traits"
                    },
                    {
                      "text": "Get Parent Class",
                      "link": "/docs/php/builtins/class/get_parent_class"
                    },
                    {
                      "text": "Interface Exists",
                      "link": "/docs/php/builtins/class/interface_exists"
                    },
                    {
                      "text": "Is A",
                      "link": "/docs/php/builtins/class/is_a"
                    },
                    {
                      "text": "Is Subclass Of",
                      "link": "/docs/php/builtins/class/is_subclass_of"
                    },
                    {
                      "text": "Trait Exists",
                      "link": "/docs/php/builtins/class/trait_exists"
                    }
                  ],
                  "link": "/docs/php/builtins/class"
                },
                {
                  "text": "Date",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Checkdate",
                      "link": "/docs/php/builtins/date/checkdate"
                    },
                    {
                      "text": "Date",
                      "link": "/docs/php/builtins/date/date"
                    },
                    {
                      "text": "Date Default Timezone Get",
                      "link": "/docs/php/builtins/date/date_default_timezone_get"
                    },
                    {
                      "text": "Date Default Timezone Set",
                      "link": "/docs/php/builtins/date/date_default_timezone_set"
                    },
                    {
                      "text": "Getdate",
                      "link": "/docs/php/builtins/date/getdate"
                    },
                    {
                      "text": "Gmdate",
                      "link": "/docs/php/builtins/date/gmdate"
                    },
                    {
                      "text": "Gmmktime",
                      "link": "/docs/php/builtins/date/gmmktime"
                    },
                    {
                      "text": "Hrtime",
                      "link": "/docs/php/builtins/date/hrtime"
                    },
                    {
                      "text": "Localtime",
                      "link": "/docs/php/builtins/date/localtime"
                    },
                    {
                      "text": "Microtime",
                      "link": "/docs/php/builtins/date/microtime"
                    },
                    {
                      "text": "Mktime",
                      "link": "/docs/php/builtins/date/mktime"
                    },
                    {
                      "text": "Strtotime",
                      "link": "/docs/php/builtins/date/strtotime"
                    },
                    {
                      "text": "Time",
                      "link": "/docs/php/builtins/date/time"
                    }
                  ],
                  "link": "/docs/php/builtins/date"
                },
                {
                  "text": "Filesystem",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Basename",
                      "link": "/docs/php/builtins/filesystem/basename"
                    },
                    {
                      "text": "Chdir",
                      "link": "/docs/php/builtins/filesystem/chdir"
                    },
                    {
                      "text": "Chgrp",
                      "link": "/docs/php/builtins/filesystem/chgrp"
                    },
                    {
                      "text": "Chmod",
                      "link": "/docs/php/builtins/filesystem/chmod"
                    },
                    {
                      "text": "Chown",
                      "link": "/docs/php/builtins/filesystem/chown"
                    },
                    {
                      "text": "Clearstatcache",
                      "link": "/docs/php/builtins/filesystem/clearstatcache"
                    },
                    {
                      "text": "Copy",
                      "link": "/docs/php/builtins/filesystem/copy"
                    },
                    {
                      "text": "Dirname",
                      "link": "/docs/php/builtins/filesystem/dirname"
                    },
                    {
                      "text": "Disk Free Space",
                      "link": "/docs/php/builtins/filesystem/disk_free_space"
                    },
                    {
                      "text": "Disk Total Space",
                      "link": "/docs/php/builtins/filesystem/disk_total_space"
                    },
                    {
                      "text": "File Exists",
                      "link": "/docs/php/builtins/filesystem/file_exists"
                    },
                    {
                      "text": "Fileatime",
                      "link": "/docs/php/builtins/filesystem/fileatime"
                    },
                    {
                      "text": "Filectime",
                      "link": "/docs/php/builtins/filesystem/filectime"
                    },
                    {
                      "text": "Filegroup",
                      "link": "/docs/php/builtins/filesystem/filegroup"
                    },
                    {
                      "text": "Fileinode",
                      "link": "/docs/php/builtins/filesystem/fileinode"
                    },
                    {
                      "text": "Filemtime",
                      "link": "/docs/php/builtins/filesystem/filemtime"
                    },
                    {
                      "text": "Fileowner",
                      "link": "/docs/php/builtins/filesystem/fileowner"
                    },
                    {
                      "text": "Fileperms",
                      "link": "/docs/php/builtins/filesystem/fileperms"
                    },
                    {
                      "text": "Filesize",
                      "link": "/docs/php/builtins/filesystem/filesize"
                    },
                    {
                      "text": "Filetype",
                      "link": "/docs/php/builtins/filesystem/filetype"
                    },
                    {
                      "text": "Fnmatch",
                      "link": "/docs/php/builtins/filesystem/fnmatch"
                    },
                    {
                      "text": "Getcwd",
                      "link": "/docs/php/builtins/filesystem/getcwd"
                    },
                    {
                      "text": "Getenv",
                      "link": "/docs/php/builtins/filesystem/getenv"
                    },
                    {
                      "text": "Glob",
                      "link": "/docs/php/builtins/filesystem/glob"
                    },
                    {
                      "text": "Is Dir",
                      "link": "/docs/php/builtins/filesystem/is_dir"
                    },
                    {
                      "text": "Is Executable",
                      "link": "/docs/php/builtins/filesystem/is_executable"
                    },
                    {
                      "text": "Is File",
                      "link": "/docs/php/builtins/filesystem/is_file"
                    },
                    {
                      "text": "Is Link",
                      "link": "/docs/php/builtins/filesystem/is_link"
                    },
                    {
                      "text": "Is Readable",
                      "link": "/docs/php/builtins/filesystem/is_readable"
                    },
                    {
                      "text": "Is Writable",
                      "link": "/docs/php/builtins/filesystem/is_writable"
                    },
                    {
                      "text": "Is Writeable",
                      "link": "/docs/php/builtins/filesystem/is_writeable"
                    },
                    {
                      "text": "Lchgrp",
                      "link": "/docs/php/builtins/filesystem/lchgrp"
                    },
                    {
                      "text": "Lchown",
                      "link": "/docs/php/builtins/filesystem/lchown"
                    },
                    {
                      "text": "Link",
                      "link": "/docs/php/builtins/filesystem/link"
                    },
                    {
                      "text": "Linkinfo",
                      "link": "/docs/php/builtins/filesystem/linkinfo"
                    },
                    {
                      "text": "Lstat",
                      "link": "/docs/php/builtins/filesystem/lstat"
                    },
                    {
                      "text": "Mkdir",
                      "link": "/docs/php/builtins/filesystem/mkdir"
                    },
                    {
                      "text": "Pathinfo",
                      "link": "/docs/php/builtins/filesystem/pathinfo"
                    },
                    {
                      "text": "Putenv",
                      "link": "/docs/php/builtins/filesystem/putenv"
                    },
                    {
                      "text": "Readfile",
                      "link": "/docs/php/builtins/filesystem/readfile"
                    },
                    {
                      "text": "Readlink",
                      "link": "/docs/php/builtins/filesystem/readlink"
                    },
                    {
                      "text": "Realpath",
                      "link": "/docs/php/builtins/filesystem/realpath"
                    },
                    {
                      "text": "Realpath Cache Get",
                      "link": "/docs/php/builtins/filesystem/realpath_cache_get"
                    },
                    {
                      "text": "Realpath Cache Size",
                      "link": "/docs/php/builtins/filesystem/realpath_cache_size"
                    },
                    {
                      "text": "Rename",
                      "link": "/docs/php/builtins/filesystem/rename"
                    },
                    {
                      "text": "Rmdir",
                      "link": "/docs/php/builtins/filesystem/rmdir"
                    },
                    {
                      "text": "Scandir",
                      "link": "/docs/php/builtins/filesystem/scandir"
                    },
                    {
                      "text": "Stat",
                      "link": "/docs/php/builtins/filesystem/stat"
                    },
                    {
                      "text": "Symlink",
                      "link": "/docs/php/builtins/filesystem/symlink"
                    },
                    {
                      "text": "Sys Get Temp Dir",
                      "link": "/docs/php/builtins/filesystem/sys_get_temp_dir"
                    },
                    {
                      "text": "Tempnam",
                      "link": "/docs/php/builtins/filesystem/tempnam"
                    },
                    {
                      "text": "Tmpfile",
                      "link": "/docs/php/builtins/filesystem/tmpfile"
                    },
                    {
                      "text": "Touch",
                      "link": "/docs/php/builtins/filesystem/touch"
                    },
                    {
                      "text": "Umask",
                      "link": "/docs/php/builtins/filesystem/umask"
                    },
                    {
                      "text": "Unlink",
                      "link": "/docs/php/builtins/filesystem/unlink"
                    }
                  ],
                  "link": "/docs/php/builtins/filesystem"
                },
                {
                  "text": "Io",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Closedir",
                      "link": "/docs/php/builtins/io/closedir"
                    },
                    {
                      "text": "Fclose",
                      "link": "/docs/php/builtins/io/fclose"
                    },
                    {
                      "text": "Fdatasync",
                      "link": "/docs/php/builtins/io/fdatasync"
                    },
                    {
                      "text": "Feof",
                      "link": "/docs/php/builtins/io/feof"
                    },
                    {
                      "text": "Fflush",
                      "link": "/docs/php/builtins/io/fflush"
                    },
                    {
                      "text": "Fgetc",
                      "link": "/docs/php/builtins/io/fgetc"
                    },
                    {
                      "text": "Fgetcsv",
                      "link": "/docs/php/builtins/io/fgetcsv"
                    },
                    {
                      "text": "Fgets",
                      "link": "/docs/php/builtins/io/fgets"
                    },
                    {
                      "text": "File",
                      "link": "/docs/php/builtins/io/file"
                    },
                    {
                      "text": "File Get Contents",
                      "link": "/docs/php/builtins/io/file_get_contents"
                    },
                    {
                      "text": "File Put Contents",
                      "link": "/docs/php/builtins/io/file_put_contents"
                    },
                    {
                      "text": "Flock",
                      "link": "/docs/php/builtins/io/flock"
                    },
                    {
                      "text": "Fopen",
                      "link": "/docs/php/builtins/io/fopen"
                    },
                    {
                      "text": "Fpassthru",
                      "link": "/docs/php/builtins/io/fpassthru"
                    },
                    {
                      "text": "Fprintf",
                      "link": "/docs/php/builtins/io/fprintf"
                    },
                    {
                      "text": "Fputcsv",
                      "link": "/docs/php/builtins/io/fputcsv"
                    },
                    {
                      "text": "Fread",
                      "link": "/docs/php/builtins/io/fread"
                    },
                    {
                      "text": "Fscanf",
                      "link": "/docs/php/builtins/io/fscanf"
                    },
                    {
                      "text": "Fseek",
                      "link": "/docs/php/builtins/io/fseek"
                    },
                    {
                      "text": "Fstat",
                      "link": "/docs/php/builtins/io/fstat"
                    },
                    {
                      "text": "Fsync",
                      "link": "/docs/php/builtins/io/fsync"
                    },
                    {
                      "text": "Ftell",
                      "link": "/docs/php/builtins/io/ftell"
                    },
                    {
                      "text": "Ftruncate",
                      "link": "/docs/php/builtins/io/ftruncate"
                    },
                    {
                      "text": "Fwrite",
                      "link": "/docs/php/builtins/io/fwrite"
                    },
                    {
                      "text": "Gethostbyaddr",
                      "link": "/docs/php/builtins/io/gethostbyaddr"
                    },
                    {
                      "text": "Gethostbyname",
                      "link": "/docs/php/builtins/io/gethostbyname"
                    },
                    {
                      "text": "Gethostname",
                      "link": "/docs/php/builtins/io/gethostname"
                    },
                    {
                      "text": "Getprotobyname",
                      "link": "/docs/php/builtins/io/getprotobyname"
                    },
                    {
                      "text": "Getprotobynumber",
                      "link": "/docs/php/builtins/io/getprotobynumber"
                    },
                    {
                      "text": "Getservbyname",
                      "link": "/docs/php/builtins/io/getservbyname"
                    },
                    {
                      "text": "Getservbyport",
                      "link": "/docs/php/builtins/io/getservbyport"
                    },
                    {
                      "text": "Hash File",
                      "link": "/docs/php/builtins/io/hash_file"
                    },
                    {
                      "text": "Opendir",
                      "link": "/docs/php/builtins/io/opendir"
                    },
                    {
                      "text": "Readdir",
                      "link": "/docs/php/builtins/io/readdir"
                    },
                    {
                      "text": "Rewind",
                      "link": "/docs/php/builtins/io/rewind"
                    },
                    {
                      "text": "Rewinddir",
                      "link": "/docs/php/builtins/io/rewinddir"
                    },
                    {
                      "text": "Stream Bucket Make Writeable",
                      "link": "/docs/php/builtins/io/stream_bucket_make_writeable"
                    },
                    {
                      "text": "Stream Bucket New",
                      "link": "/docs/php/builtins/io/stream_bucket_new"
                    },
                    {
                      "text": "Stream Context Create",
                      "link": "/docs/php/builtins/io/stream_context_create"
                    },
                    {
                      "text": "Stream Context Get Default",
                      "link": "/docs/php/builtins/io/stream_context_get_default"
                    },
                    {
                      "text": "Stream Context Get Options",
                      "link": "/docs/php/builtins/io/stream_context_get_options"
                    },
                    {
                      "text": "Stream Context Get Params",
                      "link": "/docs/php/builtins/io/stream_context_get_params"
                    },
                    {
                      "text": "Stream Context Set Default",
                      "link": "/docs/php/builtins/io/stream_context_set_default"
                    },
                    {
                      "text": "Stream Context Set Option",
                      "link": "/docs/php/builtins/io/stream_context_set_option"
                    },
                    {
                      "text": "Stream Context Set Params",
                      "link": "/docs/php/builtins/io/stream_context_set_params"
                    },
                    {
                      "text": "Stream Copy To Stream",
                      "link": "/docs/php/builtins/io/stream_copy_to_stream"
                    },
                    {
                      "text": "Stream Filter Register",
                      "link": "/docs/php/builtins/io/stream_filter_register"
                    },
                    {
                      "text": "Stream Filter Remove",
                      "link": "/docs/php/builtins/io/stream_filter_remove"
                    },
                    {
                      "text": "Stream Get Contents",
                      "link": "/docs/php/builtins/io/stream_get_contents"
                    },
                    {
                      "text": "Stream Get Filters",
                      "link": "/docs/php/builtins/io/stream_get_filters"
                    },
                    {
                      "text": "Stream Get Line",
                      "link": "/docs/php/builtins/io/stream_get_line"
                    },
                    {
                      "text": "Stream Get Meta Data",
                      "link": "/docs/php/builtins/io/stream_get_meta_data"
                    },
                    {
                      "text": "Stream Get Transports",
                      "link": "/docs/php/builtins/io/stream_get_transports"
                    },
                    {
                      "text": "Stream Get Wrappers",
                      "link": "/docs/php/builtins/io/stream_get_wrappers"
                    },
                    {
                      "text": "Stream Is Local",
                      "link": "/docs/php/builtins/io/stream_is_local"
                    },
                    {
                      "text": "Stream Isatty",
                      "link": "/docs/php/builtins/io/stream_isatty"
                    },
                    {
                      "text": "Stream Resolve Include Path",
                      "link": "/docs/php/builtins/io/stream_resolve_include_path"
                    },
                    {
                      "text": "Stream Select",
                      "link": "/docs/php/builtins/io/stream_select"
                    },
                    {
                      "text": "Stream Set Blocking",
                      "link": "/docs/php/builtins/io/stream_set_blocking"
                    },
                    {
                      "text": "Stream Set Chunk Size",
                      "link": "/docs/php/builtins/io/stream_set_chunk_size"
                    },
                    {
                      "text": "Stream Set Read Buffer",
                      "link": "/docs/php/builtins/io/stream_set_read_buffer"
                    },
                    {
                      "text": "Stream Set Timeout",
                      "link": "/docs/php/builtins/io/stream_set_timeout"
                    },
                    {
                      "text": "Stream Set Write Buffer",
                      "link": "/docs/php/builtins/io/stream_set_write_buffer"
                    },
                    {
                      "text": "Stream Socket Accept",
                      "link": "/docs/php/builtins/io/stream_socket_accept"
                    },
                    {
                      "text": "Stream Socket Client",
                      "link": "/docs/php/builtins/io/stream_socket_client"
                    },
                    {
                      "text": "Stream Socket Enable Crypto",
                      "link": "/docs/php/builtins/io/stream_socket_enable_crypto"
                    },
                    {
                      "text": "Stream Socket Get Name",
                      "link": "/docs/php/builtins/io/stream_socket_get_name"
                    },
                    {
                      "text": "Stream Socket Pair",
                      "link": "/docs/php/builtins/io/stream_socket_pair"
                    },
                    {
                      "text": "Stream Socket Recvfrom",
                      "link": "/docs/php/builtins/io/stream_socket_recvfrom"
                    },
                    {
                      "text": "Stream Socket Sendto",
                      "link": "/docs/php/builtins/io/stream_socket_sendto"
                    },
                    {
                      "text": "Stream Socket Server",
                      "link": "/docs/php/builtins/io/stream_socket_server"
                    },
                    {
                      "text": "Stream Socket Shutdown",
                      "link": "/docs/php/builtins/io/stream_socket_shutdown"
                    },
                    {
                      "text": "Stream Supports Lock",
                      "link": "/docs/php/builtins/io/stream_supports_lock"
                    },
                    {
                      "text": "Stream Wrapper Register",
                      "link": "/docs/php/builtins/io/stream_wrapper_register"
                    },
                    {
                      "text": "Stream Wrapper Restore",
                      "link": "/docs/php/builtins/io/stream_wrapper_restore"
                    },
                    {
                      "text": "Stream Wrapper Unregister",
                      "link": "/docs/php/builtins/io/stream_wrapper_unregister"
                    },
                    {
                      "text": "Vfprintf",
                      "link": "/docs/php/builtins/io/vfprintf"
                    }
                  ],
                  "link": "/docs/php/builtins/io"
                },
                {
                  "text": "Json",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Json Decode",
                      "link": "/docs/php/builtins/json/json_decode"
                    },
                    {
                      "text": "Json Encode",
                      "link": "/docs/php/builtins/json/json_encode"
                    },
                    {
                      "text": "Json Last Error",
                      "link": "/docs/php/builtins/json/json_last_error"
                    },
                    {
                      "text": "Json Last Error Msg",
                      "link": "/docs/php/builtins/json/json_last_error_msg"
                    },
                    {
                      "text": "Json Validate",
                      "link": "/docs/php/builtins/json/json_validate"
                    }
                  ],
                  "link": "/docs/php/builtins/json"
                },
                {
                  "text": "Math",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Abs",
                      "link": "/docs/php/builtins/math/abs"
                    },
                    {
                      "text": "Acos",
                      "link": "/docs/php/builtins/math/acos"
                    },
                    {
                      "text": "Asin",
                      "link": "/docs/php/builtins/math/asin"
                    },
                    {
                      "text": "Atan",
                      "link": "/docs/php/builtins/math/atan"
                    },
                    {
                      "text": "Atan2",
                      "link": "/docs/php/builtins/math/atan2"
                    },
                    {
                      "text": "Ceil",
                      "link": "/docs/php/builtins/math/ceil"
                    },
                    {
                      "text": "Clamp",
                      "link": "/docs/php/builtins/math/clamp"
                    },
                    {
                      "text": "Cos",
                      "link": "/docs/php/builtins/math/cos"
                    },
                    {
                      "text": "Cosh",
                      "link": "/docs/php/builtins/math/cosh"
                    },
                    {
                      "text": "Deg2rad",
                      "link": "/docs/php/builtins/math/deg2rad"
                    },
                    {
                      "text": "Exp",
                      "link": "/docs/php/builtins/math/exp"
                    },
                    {
                      "text": "Fdiv",
                      "link": "/docs/php/builtins/math/fdiv"
                    },
                    {
                      "text": "Floor",
                      "link": "/docs/php/builtins/math/floor"
                    },
                    {
                      "text": "Fmod",
                      "link": "/docs/php/builtins/math/fmod"
                    },
                    {
                      "text": "Hypot",
                      "link": "/docs/php/builtins/math/hypot"
                    },
                    {
                      "text": "Intdiv",
                      "link": "/docs/php/builtins/math/intdiv"
                    },
                    {
                      "text": "Is Finite",
                      "link": "/docs/php/builtins/math/is_finite"
                    },
                    {
                      "text": "Is Infinite",
                      "link": "/docs/php/builtins/math/is_infinite"
                    },
                    {
                      "text": "Is Nan",
                      "link": "/docs/php/builtins/math/is_nan"
                    },
                    {
                      "text": "Log",
                      "link": "/docs/php/builtins/math/log"
                    },
                    {
                      "text": "Log10",
                      "link": "/docs/php/builtins/math/log10"
                    },
                    {
                      "text": "Log2",
                      "link": "/docs/php/builtins/math/log2"
                    },
                    {
                      "text": "Max",
                      "link": "/docs/php/builtins/math/max"
                    },
                    {
                      "text": "Min",
                      "link": "/docs/php/builtins/math/min"
                    },
                    {
                      "text": "Mt Rand",
                      "link": "/docs/php/builtins/math/mt_rand"
                    },
                    {
                      "text": "Pi",
                      "link": "/docs/php/builtins/math/pi"
                    },
                    {
                      "text": "Pow",
                      "link": "/docs/php/builtins/math/pow"
                    },
                    {
                      "text": "Rad2deg",
                      "link": "/docs/php/builtins/math/rad2deg"
                    },
                    {
                      "text": "Rand",
                      "link": "/docs/php/builtins/math/rand"
                    },
                    {
                      "text": "Random Int",
                      "link": "/docs/php/builtins/math/random_int"
                    },
                    {
                      "text": "Round",
                      "link": "/docs/php/builtins/math/round"
                    },
                    {
                      "text": "Sin",
                      "link": "/docs/php/builtins/math/sin"
                    },
                    {
                      "text": "Sinh",
                      "link": "/docs/php/builtins/math/sinh"
                    },
                    {
                      "text": "Sqrt",
                      "link": "/docs/php/builtins/math/sqrt"
                    },
                    {
                      "text": "Tan",
                      "link": "/docs/php/builtins/math/tan"
                    },
                    {
                      "text": "Tanh",
                      "link": "/docs/php/builtins/math/tanh"
                    }
                  ],
                  "link": "/docs/php/builtins/math"
                },
                {
                  "text": "Misc",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Buffer New",
                      "link": "/docs/php/builtins/misc/buffer_new"
                    },
                    {
                      "text": "Call User Func",
                      "link": "/docs/php/builtins/misc/call_user_func"
                    },
                    {
                      "text": "Call User Func Array",
                      "link": "/docs/php/builtins/misc/call_user_func_array"
                    },
                    {
                      "text": "Define",
                      "link": "/docs/php/builtins/misc/define"
                    },
                    {
                      "text": "Defined",
                      "link": "/docs/php/builtins/misc/defined"
                    },
                    {
                      "text": "Empty",
                      "link": "/docs/php/builtins/misc/empty"
                    },
                    {
                      "text": "Header",
                      "link": "/docs/php/builtins/misc/header"
                    },
                    {
                      "text": "Http Response Code",
                      "link": "/docs/php/builtins/misc/http_response_code"
                    },
                    {
                      "text": "Isset",
                      "link": "/docs/php/builtins/misc/isset"
                    },
                    {
                      "text": "Php Uname",
                      "link": "/docs/php/builtins/misc/php_uname"
                    },
                    {
                      "text": "Phpversion",
                      "link": "/docs/php/builtins/misc/phpversion"
                    },
                    {
                      "text": "Print R",
                      "link": "/docs/php/builtins/misc/print_r"
                    },
                    {
                      "text": "Serialize",
                      "link": "/docs/php/builtins/misc/serialize"
                    },
                    {
                      "text": "Unserialize",
                      "link": "/docs/php/builtins/misc/unserialize"
                    },
                    {
                      "text": "Unset",
                      "link": "/docs/php/builtins/misc/unset"
                    },
                    {
                      "text": "Var Dump",
                      "link": "/docs/php/builtins/misc/var_dump"
                    }
                  ],
                  "link": "/docs/php/builtins/misc"
                },
                {
                  "text": "Pointer",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Ptr",
                      "link": "/docs/php/builtins/pointer/ptr"
                    },
                    {
                      "text": "Ptr Get",
                      "link": "/docs/php/builtins/pointer/ptr_get"
                    },
                    {
                      "text": "Ptr Is Null",
                      "link": "/docs/php/builtins/pointer/ptr_is_null"
                    },
                    {
                      "text": "Ptr Null",
                      "link": "/docs/php/builtins/pointer/ptr_null"
                    },
                    {
                      "text": "Ptr Offset",
                      "link": "/docs/php/builtins/pointer/ptr_offset"
                    },
                    {
                      "text": "Ptr Read String",
                      "link": "/docs/php/builtins/pointer/ptr_read_string"
                    },
                    {
                      "text": "Ptr Read16",
                      "link": "/docs/php/builtins/pointer/ptr_read16"
                    },
                    {
                      "text": "Ptr Read32",
                      "link": "/docs/php/builtins/pointer/ptr_read32"
                    },
                    {
                      "text": "Ptr Read8",
                      "link": "/docs/php/builtins/pointer/ptr_read8"
                    },
                    {
                      "text": "Ptr Set",
                      "link": "/docs/php/builtins/pointer/ptr_set"
                    },
                    {
                      "text": "Ptr Sizeof",
                      "link": "/docs/php/builtins/pointer/ptr_sizeof"
                    },
                    {
                      "text": "Ptr Write String",
                      "link": "/docs/php/builtins/pointer/ptr_write_string"
                    },
                    {
                      "text": "Ptr Write16",
                      "link": "/docs/php/builtins/pointer/ptr_write16"
                    },
                    {
                      "text": "Ptr Write32",
                      "link": "/docs/php/builtins/pointer/ptr_write32"
                    },
                    {
                      "text": "Ptr Write8",
                      "link": "/docs/php/builtins/pointer/ptr_write8"
                    }
                  ],
                  "link": "/docs/php/builtins/pointer"
                },
                {
                  "text": "Process",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Die",
                      "link": "/docs/php/builtins/process/die"
                    },
                    {
                      "text": "Exec",
                      "link": "/docs/php/builtins/process/exec"
                    },
                    {
                      "text": "Exit",
                      "link": "/docs/php/builtins/process/exit"
                    },
                    {
                      "text": "Passthru",
                      "link": "/docs/php/builtins/process/passthru"
                    },
                    {
                      "text": "Pclose",
                      "link": "/docs/php/builtins/process/pclose"
                    },
                    {
                      "text": "Popen",
                      "link": "/docs/php/builtins/process/popen"
                    },
                    {
                      "text": "Readline",
                      "link": "/docs/php/builtins/process/readline"
                    },
                    {
                      "text": "Shell Exec",
                      "link": "/docs/php/builtins/process/shell_exec"
                    },
                    {
                      "text": "Sleep",
                      "link": "/docs/php/builtins/process/sleep"
                    },
                    {
                      "text": "System",
                      "link": "/docs/php/builtins/process/system"
                    },
                    {
                      "text": "Usleep",
                      "link": "/docs/php/builtins/process/usleep"
                    }
                  ],
                  "link": "/docs/php/builtins/process"
                },
                {
                  "text": "Regex",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Preg Match",
                      "link": "/docs/php/builtins/regex/preg_match"
                    },
                    {
                      "text": "Preg Match All",
                      "link": "/docs/php/builtins/regex/preg_match_all"
                    },
                    {
                      "text": "Preg Replace",
                      "link": "/docs/php/builtins/regex/preg_replace"
                    },
                    {
                      "text": "Preg Replace Callback",
                      "link": "/docs/php/builtins/regex/preg_replace_callback"
                    },
                    {
                      "text": "Preg Split",
                      "link": "/docs/php/builtins/regex/preg_split"
                    }
                  ],
                  "link": "/docs/php/builtins/regex"
                },
                {
                  "text": "Spl",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Iterator Apply",
                      "link": "/docs/php/builtins/spl/iterator_apply"
                    },
                    {
                      "text": "Iterator Count",
                      "link": "/docs/php/builtins/spl/iterator_count"
                    },
                    {
                      "text": "Iterator To Array",
                      "link": "/docs/php/builtins/spl/iterator_to_array"
                    },
                    {
                      "text": "Spl Autoload",
                      "link": "/docs/php/builtins/spl/spl_autoload"
                    },
                    {
                      "text": "Spl Autoload Call",
                      "link": "/docs/php/builtins/spl/spl_autoload_call"
                    },
                    {
                      "text": "Spl Autoload Extensions",
                      "link": "/docs/php/builtins/spl/spl_autoload_extensions"
                    },
                    {
                      "text": "Spl Autoload Functions",
                      "link": "/docs/php/builtins/spl/spl_autoload_functions"
                    },
                    {
                      "text": "Spl Autoload Register",
                      "link": "/docs/php/builtins/spl/spl_autoload_register"
                    },
                    {
                      "text": "Spl Autoload Unregister",
                      "link": "/docs/php/builtins/spl/spl_autoload_unregister"
                    },
                    {
                      "text": "Spl Classes",
                      "link": "/docs/php/builtins/spl/spl_classes"
                    },
                    {
                      "text": "Spl Object Hash",
                      "link": "/docs/php/builtins/spl/spl_object_hash"
                    },
                    {
                      "text": "Spl Object Id",
                      "link": "/docs/php/builtins/spl/spl_object_id"
                    }
                  ],
                  "link": "/docs/php/builtins/spl"
                },
                {
                  "text": "Streams",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Fsockopen",
                      "link": "/docs/php/builtins/streams/fsockopen"
                    },
                    {
                      "text": "Pfsockopen",
                      "link": "/docs/php/builtins/streams/pfsockopen"
                    },
                    {
                      "text": "Stream Bucket Append",
                      "link": "/docs/php/builtins/streams/stream_bucket_append"
                    },
                    {
                      "text": "Stream Bucket Prepend",
                      "link": "/docs/php/builtins/streams/stream_bucket_prepend"
                    },
                    {
                      "text": "Stream Filter Append",
                      "link": "/docs/php/builtins/streams/stream_filter_append"
                    },
                    {
                      "text": "Stream Filter Prepend",
                      "link": "/docs/php/builtins/streams/stream_filter_prepend"
                    }
                  ],
                  "link": "/docs/php/builtins/streams"
                },
                {
                  "text": "String",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Addslashes",
                      "link": "/docs/php/builtins/string/addslashes"
                    },
                    {
                      "text": "Base64 Decode",
                      "link": "/docs/php/builtins/string/base64_decode"
                    },
                    {
                      "text": "Base64 Encode",
                      "link": "/docs/php/builtins/string/base64_encode"
                    },
                    {
                      "text": "Bin2hex",
                      "link": "/docs/php/builtins/string/bin2hex"
                    },
                    {
                      "text": "Chop",
                      "link": "/docs/php/builtins/string/chop"
                    },
                    {
                      "text": "Chr",
                      "link": "/docs/php/builtins/string/chr"
                    },
                    {
                      "text": "Crc32",
                      "link": "/docs/php/builtins/string/crc32"
                    },
                    {
                      "text": "Explode",
                      "link": "/docs/php/builtins/string/explode"
                    },
                    {
                      "text": "Grapheme Strrev",
                      "link": "/docs/php/builtins/string/grapheme_strrev"
                    },
                    {
                      "text": "Gzcompress",
                      "link": "/docs/php/builtins/string/gzcompress"
                    },
                    {
                      "text": "Gzdeflate",
                      "link": "/docs/php/builtins/string/gzdeflate"
                    },
                    {
                      "text": "Gzinflate",
                      "link": "/docs/php/builtins/string/gzinflate"
                    },
                    {
                      "text": "Gzuncompress",
                      "link": "/docs/php/builtins/string/gzuncompress"
                    },
                    {
                      "text": "Hash",
                      "link": "/docs/php/builtins/string/hash"
                    },
                    {
                      "text": "Hash Algos",
                      "link": "/docs/php/builtins/string/hash_algos"
                    },
                    {
                      "text": "Hash Copy",
                      "link": "/docs/php/builtins/string/hash_copy"
                    },
                    {
                      "text": "Hash Equals",
                      "link": "/docs/php/builtins/string/hash_equals"
                    },
                    {
                      "text": "Hash Final",
                      "link": "/docs/php/builtins/string/hash_final"
                    },
                    {
                      "text": "Hash Hmac",
                      "link": "/docs/php/builtins/string/hash_hmac"
                    },
                    {
                      "text": "Hash Init",
                      "link": "/docs/php/builtins/string/hash_init"
                    },
                    {
                      "text": "Hash Update",
                      "link": "/docs/php/builtins/string/hash_update"
                    },
                    {
                      "text": "Hex2bin",
                      "link": "/docs/php/builtins/string/hex2bin"
                    },
                    {
                      "text": "Html Entity Decode",
                      "link": "/docs/php/builtins/string/html_entity_decode"
                    },
                    {
                      "text": "Htmlentities",
                      "link": "/docs/php/builtins/string/htmlentities"
                    },
                    {
                      "text": "Htmlspecialchars",
                      "link": "/docs/php/builtins/string/htmlspecialchars"
                    },
                    {
                      "text": "Implode",
                      "link": "/docs/php/builtins/string/implode"
                    },
                    {
                      "text": "Inet Ntop",
                      "link": "/docs/php/builtins/string/inet_ntop"
                    },
                    {
                      "text": "Inet Pton",
                      "link": "/docs/php/builtins/string/inet_pton"
                    },
                    {
                      "text": "Ip2long",
                      "link": "/docs/php/builtins/string/ip2long"
                    },
                    {
                      "text": "Lcfirst",
                      "link": "/docs/php/builtins/string/lcfirst"
                    },
                    {
                      "text": "Long2ip",
                      "link": "/docs/php/builtins/string/long2ip"
                    },
                    {
                      "text": "Ltrim",
                      "link": "/docs/php/builtins/string/ltrim"
                    },
                    {
                      "text": "Md5",
                      "link": "/docs/php/builtins/string/md5"
                    },
                    {
                      "text": "Nl2br",
                      "link": "/docs/php/builtins/string/nl2br"
                    },
                    {
                      "text": "Number Format",
                      "link": "/docs/php/builtins/string/number_format"
                    },
                    {
                      "text": "Ord",
                      "link": "/docs/php/builtins/string/ord"
                    },
                    {
                      "text": "Printf",
                      "link": "/docs/php/builtins/string/printf"
                    },
                    {
                      "text": "Rawurldecode",
                      "link": "/docs/php/builtins/string/rawurldecode"
                    },
                    {
                      "text": "Rawurlencode",
                      "link": "/docs/php/builtins/string/rawurlencode"
                    },
                    {
                      "text": "Rtrim",
                      "link": "/docs/php/builtins/string/rtrim"
                    },
                    {
                      "text": "Sha1",
                      "link": "/docs/php/builtins/string/sha1"
                    },
                    {
                      "text": "Sprintf",
                      "link": "/docs/php/builtins/string/sprintf"
                    },
                    {
                      "text": "Sscanf",
                      "link": "/docs/php/builtins/string/sscanf"
                    },
                    {
                      "text": "Str Contains",
                      "link": "/docs/php/builtins/string/str_contains"
                    },
                    {
                      "text": "Str Ends With",
                      "link": "/docs/php/builtins/string/str_ends_with"
                    },
                    {
                      "text": "Str Ireplace",
                      "link": "/docs/php/builtins/string/str_ireplace"
                    },
                    {
                      "text": "Str Pad",
                      "link": "/docs/php/builtins/string/str_pad"
                    },
                    {
                      "text": "Str Repeat",
                      "link": "/docs/php/builtins/string/str_repeat"
                    },
                    {
                      "text": "Str Replace",
                      "link": "/docs/php/builtins/string/str_replace"
                    },
                    {
                      "text": "Str Split",
                      "link": "/docs/php/builtins/string/str_split"
                    },
                    {
                      "text": "Str Starts With",
                      "link": "/docs/php/builtins/string/str_starts_with"
                    },
                    {
                      "text": "Strcasecmp",
                      "link": "/docs/php/builtins/string/strcasecmp"
                    },
                    {
                      "text": "Strcmp",
                      "link": "/docs/php/builtins/string/strcmp"
                    },
                    {
                      "text": "Stripslashes",
                      "link": "/docs/php/builtins/string/stripslashes"
                    },
                    {
                      "text": "Strlen",
                      "link": "/docs/php/builtins/string/strlen"
                    },
                    {
                      "text": "Strpos",
                      "link": "/docs/php/builtins/string/strpos"
                    },
                    {
                      "text": "Strrev",
                      "link": "/docs/php/builtins/string/strrev"
                    },
                    {
                      "text": "Strrpos",
                      "link": "/docs/php/builtins/string/strrpos"
                    },
                    {
                      "text": "Strstr",
                      "link": "/docs/php/builtins/string/strstr"
                    },
                    {
                      "text": "Strtolower",
                      "link": "/docs/php/builtins/string/strtolower"
                    },
                    {
                      "text": "Strtoupper",
                      "link": "/docs/php/builtins/string/strtoupper"
                    },
                    {
                      "text": "Substr",
                      "link": "/docs/php/builtins/string/substr"
                    },
                    {
                      "text": "Substr Replace",
                      "link": "/docs/php/builtins/string/substr_replace"
                    },
                    {
                      "text": "Trim",
                      "link": "/docs/php/builtins/string/trim"
                    },
                    {
                      "text": "Ucfirst",
                      "link": "/docs/php/builtins/string/ucfirst"
                    },
                    {
                      "text": "Ucwords",
                      "link": "/docs/php/builtins/string/ucwords"
                    },
                    {
                      "text": "Urldecode",
                      "link": "/docs/php/builtins/string/urldecode"
                    },
                    {
                      "text": "Urlencode",
                      "link": "/docs/php/builtins/string/urlencode"
                    },
                    {
                      "text": "Vprintf",
                      "link": "/docs/php/builtins/string/vprintf"
                    },
                    {
                      "text": "Vsprintf",
                      "link": "/docs/php/builtins/string/vsprintf"
                    },
                    {
                      "text": "Wordwrap",
                      "link": "/docs/php/builtins/string/wordwrap"
                    }
                  ],
                  "link": "/docs/php/builtins/string"
                },
                {
                  "text": "Type",
                  "collapsed": true,
                  "items": [
                    {
                      "text": "Boolval",
                      "link": "/docs/php/builtins/type/boolval"
                    },
                    {
                      "text": "Ctype Alnum",
                      "link": "/docs/php/builtins/type/ctype_alnum"
                    },
                    {
                      "text": "Ctype Alpha",
                      "link": "/docs/php/builtins/type/ctype_alpha"
                    },
                    {
                      "text": "Ctype Digit",
                      "link": "/docs/php/builtins/type/ctype_digit"
                    },
                    {
                      "text": "Ctype Space",
                      "link": "/docs/php/builtins/type/ctype_space"
                    },
                    {
                      "text": "Floatval",
                      "link": "/docs/php/builtins/type/floatval"
                    },
                    {
                      "text": "Get Resource Id",
                      "link": "/docs/php/builtins/type/get_resource_id"
                    },
                    {
                      "text": "Get Resource Type",
                      "link": "/docs/php/builtins/type/get_resource_type"
                    },
                    {
                      "text": "Gettype",
                      "link": "/docs/php/builtins/type/gettype"
                    },
                    {
                      "text": "Intval",
                      "link": "/docs/php/builtins/type/intval"
                    },
                    {
                      "text": "Is Array",
                      "link": "/docs/php/builtins/type/is_array"
                    },
                    {
                      "text": "Is Bool",
                      "link": "/docs/php/builtins/type/is_bool"
                    },
                    {
                      "text": "Is Callable",
                      "link": "/docs/php/builtins/type/is_callable"
                    },
                    {
                      "text": "Is Float",
                      "link": "/docs/php/builtins/type/is_float"
                    },
                    {
                      "text": "Is Int",
                      "link": "/docs/php/builtins/type/is_int"
                    },
                    {
                      "text": "Is Iterable",
                      "link": "/docs/php/builtins/type/is_iterable"
                    },
                    {
                      "text": "Is Null",
                      "link": "/docs/php/builtins/type/is_null"
                    },
                    {
                      "text": "Is Numeric",
                      "link": "/docs/php/builtins/type/is_numeric"
                    },
                    {
                      "text": "Is Object",
                      "link": "/docs/php/builtins/type/is_object"
                    },
                    {
                      "text": "Is Resource",
                      "link": "/docs/php/builtins/type/is_resource"
                    },
                    {
                      "text": "Is Scalar",
                      "link": "/docs/php/builtins/type/is_scalar"
                    },
                    {
                      "text": "Is String",
                      "link": "/docs/php/builtins/type/is_string"
                    },
                    {
                      "text": "Settype",
                      "link": "/docs/php/builtins/type/settype"
                    }
                  ],
                  "link": "/docs/php/builtins/type"
                }
              ],
              "link": "/docs/php/builtins"
            },
            {
              "text": "Calendar",
              "link": "/docs/php/calendar"
            },
            {
              "text": "Classes",
              "link": "/docs/php/classes"
            },
            {
              "text": "Control Structures",
              "link": "/docs/php/control-structures"
            },
            {
              "text": "Datetime",
              "link": "/docs/php/datetime"
            },
            {
              "text": "Fibers",
              "link": "/docs/php/fibers"
            },
            {
              "text": "Functions",
              "link": "/docs/php/functions"
            },
            {
              "text": "Generators",
              "link": "/docs/php/generators"
            },
            {
              "text": "Image",
              "link": "/docs/php/image"
            },
            {
              "text": "Magic Constants",
              "link": "/docs/php/magic-constants"
            },
            {
              "text": "Math",
              "link": "/docs/php/math"
            },
            {
              "text": "Namespaces",
              "link": "/docs/php/namespaces"
            },
            {
              "text": "Operators",
              "link": "/docs/php/operators"
            },
            {
              "text": "Pdo",
              "link": "/docs/php/pdo"
            },
            {
              "text": "Regex",
              "link": "/docs/php/regex"
            },
            {
              "text": "Spl",
              "link": "/docs/php/spl"
            },
            {
              "text": "Streams",
              "link": "/docs/php/streams"
            },
            {
              "text": "Strings",
              "link": "/docs/php/strings"
            },
            {
              "text": "System And Io",
              "link": "/docs/php/system-and-io"
            },
            {
              "text": "Types",
              "link": "/docs/php/types"
            }
          ]
        }
      ]
    }
  ],
  "/showcases/": [
    {
      "text": "案例展示",
      "items": [
        {
          "text": "总览",
          "link": "/showcases/"
        },
        {
          "text": "DOOM E1M1 — 用 PHP 渲染，编译为原生 ARM64 二进制文件",
          "link": "/showcases/doom/"
        },
        {
          "text": "elephc http-server — PHP 编写的原生异步 HTTP 服务器",
          "link": "/showcases/http-server/"
        }
      ]
    }
  ],
  "/examples/": [
    {
      "text": "示例",
      "items": [
        {
          "text": "总览",
          "link": "/examples/"
        },
        {
          "text": "`--emit cdylib` 端到端演示",
          "link": "/examples/cdylib/"
        }
      ]
    }
  ]
};
