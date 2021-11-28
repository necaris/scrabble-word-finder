open Tea

type msg =
  | LocationChanged of Web.Location.location
  | NavigationRequested of string
  | InputChanged of string
  | ResultsLoaded of (string,string Http.error) Result.t
[@@bs.deriving { accessors }]

type candidate =
  { word: string
  ; letters_matched: int
  ; score: int
  ; definition: string
  }

type candidate_list =
  | Loading
  | NoInput
  | Success of candidate list
  | Failure of string

type model = {
  page: string;
  input: string option;
  candidates: candidate_list;
}

let load_solutions letters =
  let params =
    [("letters", letters);
     ("limit", "50");
     ("sort_by", "match_count_desc");
     ("min_match", "3")] in
  let qs =
    params
    |> List.map (fun (k,v)  -> Printf.sprintf "%s=%s" k v)
    |> (String.concat "&") in
  let url = Printf.sprintf "/solve?%s" qs in
  Http.request
    {
      method' = "GET";
      headers = [Http.Header ("Content-Type", "application/json")];
      url;
      body = Web.XMLHttpRequest.EmptyBody;
      expect = Http.expectString;
      timeout = None;
      withCredentials = false
    }
  |> Http.send resultsLoaded

let decode_solutions data =
  let open Json.Decoder in
  let candidate_decoder =
    map4
      (fun w m s d ->
         { word = w; letters_matched = m; score = s; definition = d })
      (field "word" string)
      (field "lettersMatched" int)
      (field "score" int)
      (field "definition" string) in
  let candidates_decoder = list candidate_decoder in
  let data_decoder = (field "data" candidates_decoder) in
  match decodeString data_decoder data with
  | Ok candidates -> Success candidates
  | Error s -> Failure s

let init () location =
  ({
    page = (location.Web.Location.pathname);
    input = None;
    candidates = NoInput
  }, Cmd.none)

let update model msg =
  match msg with
  | NavigationRequested url -> (model, (Navigation.modifyUrl url))
  | LocationChanged location ->
    ({ model with page = (location.Web.Location.pathname) }, Cmd.none)
  | InputChanged new_input ->
    let updated_model = { model with input = (Some new_input) } in
    if new_input = ""
    then ({ updated_model with candidates = NoInput }, Cmd.none)
    else ({ updated_model with candidates = Loading }, load_solutions new_input)
  | ResultsLoaded result ->
    (match result with
     | Ok candidates_data ->
       ({ model with candidates = (decode_solutions candidates_data) },
        Cmd.none)
     | Error s ->
       ({ model with candidates = (Failure (Http.string_of_error s)) },
        Cmd.none))

let view_link path txt =
  let open Html in
  a [href path;
     onWithOptions ~key:"" "click"
       { defaultOptions with preventDefault = true }
       (Tea.Json.Decoder.succeed (NavigationRequested path))]
    [text txt]

let view_text_input maybe_placeholder maybe_value on_input_msg =
  let open Html in
  let attrs = [type' "text"; onInput on_input_msg] in
  let with_placeholder =
    match maybe_placeholder with
    | Some txt -> (placeholder txt) :: attrs
    | None -> attrs in
  let with_value =
    match maybe_value with
    | Some v -> (value v) :: attrs
    | None  -> attrs in
  input' attrs []

let view_candidate c =
  let open Html in
  li [] [ p [ style "font-weight" "bold" ] [ text c.word ]
        ; span [] [ text (Printf.sprintf "matched %d" c.letters_matched) ]
        ; span [ style "font-weight" "bold" ]
            [ text (Printf.sprintf "%d points" c.score) ]
        ; p [ style "font-size" "small"; style "font-style" "italic" ]
            [ text c.definition ]
        ]


let view_candidate_list candidates =
  let open Html in
  match candidates with
  | NoInput  -> []
  | Loading  -> [text "... loading ..."]
  | Failure s -> [p [style "color" "red"] [text s]]
  | Success candidates -> [ol [] (List.map view_candidate candidates)]

let view_home model =
  let open Html in
  div [class' "container"]
    [h2 [] [text "Anyone for Scrabble?"];
     div [class' "row"]
       [view_text_input (Some "Letters here...") model.input inputChanged];
     div [class' "row"] (view_candidate_list model.candidates);
     view_link "/other" "Try the other";
     view_link "/nope" "Me no likey"]

let view_other model =
  let open Html in
  div [class' "container"]
    [h2 [] [text "Other stuff"]
    ; view_link "/" "Go back home"]

let view_not_found model =
  let open Html in
  div [class' "container"]
    [ h3 [] [text ("I don't know this: " ^ model.page)]
    ; view_link "/" "Return to the home"]

let view_main model =
  match model.page with
  | "/" -> view_home model
  | "/other" -> view_other model
  | _ -> view_not_found model

let view model =
  let open Html in
  div [] [ aside [] [text "Sidebar"]
         ; main [] [view_main model]]

let main =
  Navigation.navigationProgram locationChanged
    {
      init;
      update;
      view;
      subscriptions = (fun _  -> Sub.none);
      shutdown = (fun _  -> Cmd.none)
    }
