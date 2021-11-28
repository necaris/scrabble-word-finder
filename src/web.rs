use serde::{Deserialize, Serialize};

use actix_files::Files;
use actix_http::ResponseBuilder;
use actix_web::{error, http::header, http::StatusCode, web, HttpResponse};

// Import from other local modules
use crate::solver::{Solution, Solver};
use crate::Error;

// Custom error more or less copied from Actix docs
impl error::ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        ResponseBuilder::new(self.status_code())
            .set_header(header::CONTENT_TYPE, "text/html; charset=utf-8")
            .body(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        match *self {
            Error::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            Error::BadClientData => StatusCode::BAD_REQUEST,
            Error::Startup => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

// This struct represents state
pub struct AppState {
    // TODO: make this a reference, figure out how to share it
    pub solver: Solver,
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SortOption {
    ScoreAsc,
    MatchCountAsc,
    ScoreDesc,
    MatchCountDesc,
}

// Read the input off the path
#[derive(Deserialize)]
struct Input {
    letters: String,
    min_match: Option<u8>,
    sort_by: Option<SortOption>,
    limit: Option<u8>,
}

#[derive(Serialize)]
struct Output<'a> {
    data: Vec<&'a Solution>,
}

async fn solve(
    state: web::Data<AppState>,
    input: web::Query<Input>,
) -> Result<HttpResponse, Error> {
    if !input.letters.is_ascii() {
        return Err(Error::BadClientData);
    }

    let all_solutions = state.solver.solve(&input.letters)?;

    let mut solutions: Vec<&Solution> = all_solutions.iter().collect();
    if input.min_match.is_some() {
        let m = input.min_match.unwrap();
        solutions = solutions
            .iter()
            .filter(|s| s.letters_matched >= m)
            .map(|s| *s)
            .collect();
    }
    // TODO: sould be able to start with or end with or incorporate some available letter
    // on the board. If so, it shouldn't allow any non-input letters. More general prefix-
    // or suffix-matching is probably a good idea
    // TODO: limiting length to fit a space on the board
    if input.sort_by.is_some() {
        match input.sort_by.as_ref().unwrap() {
            SortOption::ScoreAsc => solutions.sort_unstable_by_key(|s| (s.score, s.letters_matched)),
            SortOption::MatchCountAsc => solutions.sort_unstable_by_key(|s| (s.letters_matched, s.score)),
            SortOption::ScoreDesc => {
                solutions.sort_unstable_by_key(|s| (s.score, s.letters_matched));
                solutions.reverse()
            }
            SortOption::MatchCountDesc => {
                solutions.sort_unstable_by_key(|s| (s.letters_matched, s.score));
                solutions.reverse()
            }
        };
    }
    if input.limit.is_some() {
        let l = input.limit.unwrap() as usize;
        solutions = solutions.iter().take(l).map(|s| *s).collect();
    }

    let result = Output { data: solutions };
    Ok(HttpResponse::Ok().json(result))
}

/// Set up the public-facing web service
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/solve", web::get().to(solve)).service(
        Files::new("/", "static")
            .index_file("index.html")
            .use_etag(true)
            .use_last_modified(true),
    );
}
