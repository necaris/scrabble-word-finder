// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE

import * as List from "bs-platform/lib/es6/list.js";
import * as Curry from "bs-platform/lib/es6/curry.js";
import * as Printf from "bs-platform/lib/es6/printf.js";
import * as $$String from "bs-platform/lib/es6/string.js";
import * as Tea_cmd from "bucklescript-tea/src-ocaml/tea_cmd.js";
import * as Tea_sub from "bucklescript-tea/src-ocaml/tea_sub.js";
import * as Tea_html from "bucklescript-tea/src-ocaml/tea_html.js";
import * as Tea_http from "bucklescript-tea/src-ocaml/tea_http.js";
import * as Tea_json from "bucklescript-tea/src-ocaml/tea_json.js";
import * as Tea_navigation from "bucklescript-tea/src-ocaml/tea_navigation.js";
import * as Caml_chrome_debugger from "bs-platform/lib/es6/caml_chrome_debugger.js";

function locationChanged(param_0) {
  return /* LocationChanged */Caml_chrome_debugger.variant("LocationChanged", 0, [param_0]);
}

function navigationRequested(param_0) {
  return /* NavigationRequested */Caml_chrome_debugger.variant("NavigationRequested", 1, [param_0]);
}

function inputChanged(param_0) {
  return /* InputChanged */Caml_chrome_debugger.variant("InputChanged", 2, [param_0]);
}

function resultsLoaded(param_0) {
  return /* ResultsLoaded */Caml_chrome_debugger.variant("ResultsLoaded", 3, [param_0]);
}

function load_solutions(letters) {
  var params_000 = /* tuple */[
    "letters",
    letters
  ];
  var params_001 = /* :: */Caml_chrome_debugger.simpleVariant("::", [
      /* tuple */[
        "limit",
        "50"
      ],
      /* :: */Caml_chrome_debugger.simpleVariant("::", [
          /* tuple */[
            "sort_by",
            "match_count_desc"
          ],
          /* :: */Caml_chrome_debugger.simpleVariant("::", [
              /* tuple */[
                "min_match",
                "3"
              ],
              /* [] */0
            ])
        ])
    ]);
  var params = /* :: */Caml_chrome_debugger.simpleVariant("::", [
      params_000,
      params_001
    ]);
  var qs = $$String.concat("&", List.map((function (param) {
              return Curry._2(Printf.sprintf(/* Format */Caml_chrome_debugger.simpleVariant("Format", [
                                /* String */Caml_chrome_debugger.variant("String", 2, [
                                    /* No_padding */0,
                                    /* Char_literal */Caml_chrome_debugger.variant("Char_literal", 12, [
                                        /* "=" */61,
                                        /* String */Caml_chrome_debugger.variant("String", 2, [
                                            /* No_padding */0,
                                            /* End_of_format */0
                                          ])
                                      ])
                                  ]),
                                "%s=%s"
                              ])), param[0], param[1]);
            }), params));
  var url = Curry._1(Printf.sprintf(/* Format */Caml_chrome_debugger.simpleVariant("Format", [
              /* String_literal */Caml_chrome_debugger.variant("String_literal", 11, [
                  "/solve?",
                  /* String */Caml_chrome_debugger.variant("String", 2, [
                      /* No_padding */0,
                      /* End_of_format */0
                    ])
                ]),
              "/solve?%s"
            ])), qs);
  return Tea_http.send(resultsLoaded, Tea_http.request({
                  "method'": "GET",
                  headers: /* :: */Caml_chrome_debugger.simpleVariant("::", [
                      /* Header */Caml_chrome_debugger.simpleVariant("Header", [
                          "Content-Type",
                          "application/json"
                        ]),
                      /* [] */0
                    ]),
                  url: url,
                  body: /* EmptyBody */0,
                  expect: Tea_http.expectString,
                  timeout: undefined,
                  withCredentials: false
                }));
}

function decode_solutions(data) {
  var candidate_decoder = Tea_json.Decoder.map4((function (w, m, s, d) {
          return {
                  word: w,
                  letters_matched: m,
                  score: s,
                  definition: d
                };
        }), Tea_json.Decoder.field("word", Tea_json.Decoder.string), Tea_json.Decoder.field("lettersMatched", Tea_json.Decoder.$$int), Tea_json.Decoder.field("score", Tea_json.Decoder.$$int), Tea_json.Decoder.field("definition", Tea_json.Decoder.string));
  var candidates_decoder = Tea_json.Decoder.list(candidate_decoder);
  var data_decoder = Tea_json.Decoder.field("data", candidates_decoder);
  var candidates = Tea_json.Decoder.decodeString(data_decoder, data);
  if (candidates.tag) {
    return /* Failure */Caml_chrome_debugger.variant("Failure", 1, [candidates[0]]);
  } else {
    return /* Success */Caml_chrome_debugger.variant("Success", 0, [candidates[0]]);
  }
}

function init(param, $$location) {
  return /* tuple */[
          {
            page: $$location.pathname,
            input: undefined,
            candidates: /* NoInput */1
          },
          Tea_cmd.none
        ];
}

function update(model, msg) {
  switch (msg.tag | 0) {
    case /* LocationChanged */0 :
        return /* tuple */[
                {
                  page: msg[0].pathname,
                  input: model.input,
                  candidates: model.candidates
                },
                Tea_cmd.none
              ];
    case /* NavigationRequested */1 :
        return /* tuple */[
                model,
                Tea_navigation.modifyUrl(msg[0])
              ];
    case /* InputChanged */2 :
        var new_input = msg[0];
        var updated_model_page = model.page;
        var updated_model_input = new_input;
        var updated_model_candidates = model.candidates;
        if (new_input === "") {
          return /* tuple */[
                  {
                    page: updated_model_page,
                    input: updated_model_input,
                    candidates: /* NoInput */1
                  },
                  Tea_cmd.none
                ];
        } else {
          return /* tuple */[
                  {
                    page: updated_model_page,
                    input: updated_model_input,
                    candidates: /* Loading */0
                  },
                  load_solutions(new_input)
                ];
        }
    case /* ResultsLoaded */3 :
        var result = msg[0];
        if (result.tag) {
          return /* tuple */[
                  {
                    page: model.page,
                    input: model.input,
                    candidates: /* Failure */Caml_chrome_debugger.variant("Failure", 1, [Tea_http.string_of_error(result[0])])
                  },
                  Tea_cmd.none
                ];
        } else {
          return /* tuple */[
                  {
                    page: model.page,
                    input: model.input,
                    candidates: decode_solutions(result[0])
                  },
                  Tea_cmd.none
                ];
        }
    
  }
}

function view_link(path, txt) {
  return Tea_html.a(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.href(path),
                /* :: */Caml_chrome_debugger.simpleVariant("::", [
                    Tea_html.onWithOptions("", "click", {
                          stopPropagation: Tea_html.defaultOptions.stopPropagation,
                          preventDefault: true
                        }, Tea_json.Decoder.succeed(/* NavigationRequested */Caml_chrome_debugger.variant("NavigationRequested", 1, [path]))),
                    /* [] */0
                  ])
              ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.text(txt),
                /* [] */0
              ]));
}

function view_text_input(maybe_placeholder, maybe_value, on_input_msg) {
  var attrs_000 = Tea_html.type$prime("text");
  var attrs_001 = /* :: */Caml_chrome_debugger.simpleVariant("::", [
      Tea_html.onInput(undefined, on_input_msg),
      /* [] */0
    ]);
  var attrs = /* :: */Caml_chrome_debugger.simpleVariant("::", [
      attrs_000,
      attrs_001
    ]);
  if (maybe_placeholder !== undefined) {
    /* :: */Caml_chrome_debugger.simpleVariant("::", [
        Tea_html.placeholder(maybe_placeholder),
        attrs
      ]);
  }
  if (maybe_value !== undefined) {
    /* :: */Caml_chrome_debugger.simpleVariant("::", [
        Tea_html.value(maybe_value),
        attrs
      ]);
  }
  return Tea_html.input$prime(undefined, undefined, attrs, /* [] */0);
}

function view_candidate(c) {
  return Tea_html.li(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.p(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.style("font-weight", "bold"),
                        /* [] */0
                      ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.text(c.word),
                        /* [] */0
                      ])),
                /* :: */Caml_chrome_debugger.simpleVariant("::", [
                    Tea_html.span(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                            Tea_html.text(Curry._1(Printf.sprintf(/* Format */Caml_chrome_debugger.simpleVariant("Format", [
                                            /* String_literal */Caml_chrome_debugger.variant("String_literal", 11, [
                                                "matched ",
                                                /* Int */Caml_chrome_debugger.variant("Int", 4, [
                                                    /* Int_d */0,
                                                    /* No_padding */0,
                                                    /* No_precision */0,
                                                    /* End_of_format */0
                                                  ])
                                              ]),
                                            "matched %d"
                                          ])), c.letters_matched)),
                            /* [] */0
                          ])),
                    /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.span(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                Tea_html.style("font-weight", "bold"),
                                /* [] */0
                              ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                Tea_html.text(Curry._1(Printf.sprintf(/* Format */Caml_chrome_debugger.simpleVariant("Format", [
                                                /* Int */Caml_chrome_debugger.variant("Int", 4, [
                                                    /* Int_d */0,
                                                    /* No_padding */0,
                                                    /* No_precision */0,
                                                    /* String_literal */Caml_chrome_debugger.variant("String_literal", 11, [
                                                        " points",
                                                        /* End_of_format */0
                                                      ])
                                                  ]),
                                                "%d points"
                                              ])), c.score)),
                                /* [] */0
                              ])),
                        /* :: */Caml_chrome_debugger.simpleVariant("::", [
                            Tea_html.p(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                    Tea_html.style("font-size", "small"),
                                    /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                        Tea_html.style("font-style", "italic"),
                                        /* [] */0
                                      ])
                                  ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                    Tea_html.text(c.definition),
                                    /* [] */0
                                  ])),
                            /* [] */0
                          ])
                      ])
                  ])
              ]));
}

function view_candidate_list(candidates) {
  if (typeof candidates === "number") {
    if (candidates === /* Loading */0) {
      return /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.text("... loading ..."),
                /* [] */0
              ]);
    } else {
      return /* [] */0;
    }
  } else if (candidates.tag) {
    return /* :: */Caml_chrome_debugger.simpleVariant("::", [
              Tea_html.p(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                      Tea_html.style("color", "red"),
                      /* [] */0
                    ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                      Tea_html.text(candidates[0]),
                      /* [] */0
                    ])),
              /* [] */0
            ]);
  } else {
    return /* :: */Caml_chrome_debugger.simpleVariant("::", [
              Tea_html.ol(undefined, undefined, /* [] */0, List.map(view_candidate, candidates[0])),
              /* [] */0
            ]);
  }
}

function view_home(model) {
  return Tea_html.div(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.class$prime("container"),
                /* [] */0
              ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.h2(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.text("Anyone for Scrabble?"),
                        /* [] */0
                      ])),
                /* :: */Caml_chrome_debugger.simpleVariant("::", [
                    Tea_html.div(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                            Tea_html.class$prime("row"),
                            /* [] */0
                          ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                            view_text_input("Letters here...", model.input, inputChanged),
                            /* [] */0
                          ])),
                    /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.div(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                Tea_html.class$prime("row"),
                                /* [] */0
                              ]), view_candidate_list(model.candidates)),
                        /* :: */Caml_chrome_debugger.simpleVariant("::", [
                            view_link("/other", "Try the other"),
                            /* :: */Caml_chrome_debugger.simpleVariant("::", [
                                view_link("/nope", "Me no likey"),
                                /* [] */0
                              ])
                          ])
                      ])
                  ])
              ]));
}

function view_other(model) {
  return Tea_html.div(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.class$prime("container"),
                /* [] */0
              ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.h2(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.text("Other stuff"),
                        /* [] */0
                      ])),
                /* :: */Caml_chrome_debugger.simpleVariant("::", [
                    view_link("/", "Go back home"),
                    /* [] */0
                  ])
              ]));
}

function view_not_found(model) {
  return Tea_html.div(undefined, undefined, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.class$prime("container"),
                /* [] */0
              ]), /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.h3(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.text("I don't know this: " + model.page),
                        /* [] */0
                      ])),
                /* :: */Caml_chrome_debugger.simpleVariant("::", [
                    view_link("/", "Return to the home"),
                    /* [] */0
                  ])
              ]));
}

function view_main(model) {
  var match = model.page;
  switch (match) {
    case "/" :
        return view_home(model);
    case "/other" :
        return view_other(model);
    default:
      return view_not_found(model);
  }
}

function view(model) {
  return Tea_html.div(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                Tea_html.aside(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                        Tea_html.text("Sidebar"),
                        /* [] */0
                      ])),
                /* :: */Caml_chrome_debugger.simpleVariant("::", [
                    Tea_html.main(undefined, undefined, /* [] */0, /* :: */Caml_chrome_debugger.simpleVariant("::", [
                            view_main(model),
                            /* [] */0
                          ])),
                    /* [] */0
                  ])
              ]));
}

var main = Tea_navigation.navigationProgram(locationChanged, {
      init: init,
      update: update,
      view: view,
      subscriptions: (function (param) {
          return Tea_sub.none;
        }),
      shutdown: (function (param) {
          return Tea_cmd.none;
        })
    });

export {
  locationChanged ,
  navigationRequested ,
  inputChanged ,
  resultsLoaded ,
  load_solutions ,
  decode_solutions ,
  init ,
  update ,
  view_link ,
  view_text_input ,
  view_candidate ,
  view_candidate_list ,
  view_home ,
  view_other ,
  view_not_found ,
  view_main ,
  view ,
  main ,
  
}
/* main Not a pure module */
