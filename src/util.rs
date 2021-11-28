use std::path::Path;
use std::fs::File;
use std::io::prelude::*;
use std::io::BufReader;

use crate::{Error, DictionaryEntry};


/// Expected to be a tab-separated WORD -> DEFINITION file
pub fn read_word_list(filename: &Path) -> Result<Vec<DictionaryEntry>, Error> {
    let file = File::open(&filename)?;
    let reader = BufReader::new(file);

    let mut entries = Vec::new();
    for l in reader.lines() {
        let line = l?;
        let mut pieces = line.splitn(2, "\t");
        entries.push(
            DictionaryEntry(pieces.next().ok_or(Error::Startup)?.to_string(),
                            pieces.next().ok_or(Error::Startup)?.to_string()));
    }

    Ok(entries)
}
