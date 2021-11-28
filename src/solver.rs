use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::{DictionaryEntry, Error};

lazy_static! {
    static ref LETTER_SCORES: HashMap<char, u8> = {
        let mut m = HashMap::new();
        m.insert('A', 1);
        m.insert('B', 3);
        m.insert('C', 3);
        m.insert('D', 2);
        m.insert('E', 1);
        m.insert('F', 4);
        m.insert('G', 2);
        m.insert('H', 4);
        m.insert('I', 1);
        m.insert('J', 8);
        m.insert('K', 5);
        m.insert('L', 1);
        m.insert('M', 3);
        m.insert('N', 1);
        m.insert('O', 1);
        m.insert('P', 3);
        m.insert('Q', 10);
        m.insert('R', 1);
        m.insert('S', 1);
        m.insert('T', 1);
        m.insert('U', 1);
        m.insert('V', 4);
        m.insert('W', 4);
        m.insert('X', 8);
        m.insert('Y', 4);
        m.insert('Z', 10);
        m
    };
}

// TODO: this should probably return a Result, in case of bad input?
pub fn compute_score(w: &str) -> u8 {
    w.chars()
        .map(|c| c.to_uppercase())
        .flatten()
        .map(|c| LETTER_SCORES.get(&c).unwrap_or(&0))
        .sum()
}

pub fn construct_breakdown(w: &str) -> HashMap<char, u32> {
    let mut counts = HashMap::new();
    for c in w.chars().map(char::to_uppercase).flatten() {
        let count = counts.entry(c).or_insert(0);
        *count += 1;
    }
    counts
}

#[derive(PartialEq, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // because frontend conventions
pub struct Solution {
    // TODO: we can generally be sure that the Candidates in the Solver
    // live longer than the Solutions that are constructed, returned, and
    // thrown away. These can be borrowings?
    pub word: String,
    pub score: u8,
    pub letters_matched: u8,
    pub definition: Option<String>,
}

#[derive(PartialEq, Debug, Clone)]
struct Candidate {
    word: String,
    breakdown: HashMap<char, u32>,
    score: u8,
    definition: Option<String>,
}

impl Candidate {
    pub fn new(w: &str, definition: Option<&str>) -> Self {
        Self {
            word: (*w).to_string(),
            breakdown: construct_breakdown(w),
            score: compute_score(w),
            definition: match definition {
                None => None,
                Some(s) => Some(s.to_string()),
            },
        }
    }

    pub fn from_word(w: &str) -> Self {
        Self::new(w, None)
    }

    pub fn matches(&self, inp: &Input) -> Option<u8> {
        // For a candidate to match an input, it has to:
        // - have at most one letter that's not in the input (because
        //   you can tag the solution on to another word already on the board)
        // - if it matches, there'll be a number of letters matched
        let mut matched_count = 0i32;
        let mut not_in_input = 0;
        for (chr, count) in self.breakdown.iter() {
            match inp.breakdown.get(chr) {
                None => {
                    not_in_input += count;
                }
                Some(other_count) => {
                    if count > other_count {
                        not_in_input += count - other_count;
                    }
                    matched_count += *count as i32;
                }
            }
        }

        // We should only count matches that were actually in the input
        matched_count -= not_in_input as i32;

        if not_in_input > 1 {
            None
        } else {
            Some(matched_count as u8)
        }
    }
}

impl From<&DictionaryEntry> for Candidate {
    fn from(de: &DictionaryEntry) -> Self {
        Self::new(&de.0, Some(&de.1))
    }
}

pub struct Input {
    word: String,
    breakdown: HashMap<char, u32>,
}

impl Input {
    pub fn new(w: &str) -> Self {
        Self {
            word: (*w).to_string(),
            breakdown: construct_breakdown(w),
        }
    }
}

#[derive(PartialEq, Debug, Clone)]
pub struct Solver {
    candidates: Vec<Candidate>,
}

impl Solver {
    pub fn from_dictionary(entries: Vec<DictionaryEntry>) -> Self {
        Self {
            candidates: entries.iter().map(|de| Candidate::from(de)).collect(),
        }
    }

    pub fn solve(&self, input: &str) -> Result<Vec<Solution>, Error> {
        // TODO: does this need to return a Result? is it fallible?
        let target = Input::new(input);
        let solns: Vec<Solution> = self
            .candidates
            .iter()
            .map(|c| {
                let matches = c.matches(&target);
                (matches, c)
            })
            .filter(|(matches, _)| matches.is_some())
            .map(|(count, candidate)| Solution {
                word: candidate.word.clone(),
                score: candidate.score,
                definition: candidate.definition.clone(),
                // safe to do, we filtered out the Nones
                letters_matched: count.unwrap(),
            })
            .collect();
        Ok(solns)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn score() {
        assert_eq!(compute_score("sea"), 3);
        assert_eq!(compute_score("doggie"), 9);
        assert_eq!(compute_score("zyzzyx"), 46);
        assert_eq!(compute_score("quizzical"), 38);
        assert_eq!(compute_score("qzqzqzqzqzqzqzqzqzqzqzqzq"), 250);
    }

    #[test]
    fn create_candidate() {
        let candidate = Candidate::from_word("abacus");
        assert_eq!(candidate.word, "abacus");
        assert_eq!(candidate.breakdown.get(&'A'), Some(&2u32));
        assert_eq!(candidate.breakdown.get(&'U'), Some(&1u32));
    }

    #[test]
    fn matches() {
        let candidate = Candidate::from_word("abacuS");
        let target1 = Input::new("abbacccuSS");
        let target2 = Input::new("abacq");
        let target3 = Input::new("abacc");
        assert_eq!(candidate.matches(&target1), Some(6));
        assert_eq!(candidate.matches(&target2), None);
        assert_eq!(candidate.matches(&target3), None);
    }

    #[test]
    fn create_solver() {
        let entries = vec![
            DictionaryEntry(String::from("abacus"), String::from("")),
            DictionaryEntry(String::from("abaci"), String::from("")),
            DictionaryEntry(String::from("fish"), String::from("")),
        ];
        let solver = Solver::from_dictionary(entries.clone());
        assert_eq!(
            solver.candidates,
            vec![
                Candidate::from(&entries[0]),
                Candidate::from(&entries[1]),
                Candidate::from(&entries[2])
            ]
        );
    }

    #[test]
    fn solve() {
        let entries = vec![
            DictionaryEntry(String::from("abacus"), String::from("")),
            DictionaryEntry(String::from("abaci"), String::from("")),
            DictionaryEntry(String::from("FISH"), String::from("")),
            DictionaryEntry(String::from("clear"), String::from("")),
            DictionaryEntry(String::from("curly"), String::from("")),
        ];
        let solver = Solver::from_dictionary(entries);
        assert_eq!(
            solver.solve("aBaCuSeS").unwrap(),
            vec![
                Solution {
                    word: String::from("abacus"),
                    score: 10,
                    definition: Some(String::from("")),
                    letters_matched: 6,
                },
                Solution {
                    word: String::from("abaci"),
                    score: 9,
                    definition: Some(String::from("")),
                    letters_matched: 4,
                }
            ]
        );
        assert_eq!(
            solver.solve("fis").unwrap(),
            vec![Solution {
                word: String::from("FISH"),
                score: 10,
                definition: Some(String::from("")),
                letters_matched: 3,
            }]
        );
        assert_eq!(
            solver.solve("lmscyeaurv").unwrap(),
            vec![
                Solution {
                    word: String::from("clear"),
                    score: 7,
                    definition: Some(String::from("")),
                    letters_matched: 5,
                },
                Solution {
                    word: String::from("curly"),
                    score: 10,
                    definition: Some(String::from("")),
                    letters_matched: 5,
                }
            ]
        );
    }
}
