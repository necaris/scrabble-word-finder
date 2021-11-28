use std::path::PathBuf;

extern crate structopt;
use structopt::StructOpt;

extern crate scrabbler;

use scrabbler::{solver, util, web};

use actix_web::{App, HttpServer};

#[derive(Debug, StructOpt)]
#[structopt(name = "scrabbler", about = "Solve your Scrabble woes")]
struct Opts {
    #[structopt(long, short)]
    /// Input file to read
    words_file: PathBuf,
    #[structopt(long, short, default_value = "127.0.0.1")]
    /// Host to bind to
    host: String,
    #[structopt(long, short, default_value = "8088")]
    /// Port to bind to
    port: usize,
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let opts = Opts::from_args();
    let binding = format!("{}:{}", opts.host, opts.port);

    println!("Loading dictionary: {:?}", opts.words_file);
    let dictionary = util::read_word_list(&opts.words_file)?;
    let solver = solver::Solver::from_dictionary(dictionary);
    println!("...loaded, serving at: {}", binding);

    HttpServer::new(move || {
        App::new()
            .data(web::AppState {
                solver: solver.clone(),
            })
            .configure(web::configure)
    })
    .workers(2)
    .bind(binding)?
    .run()
    .await
}
