module Main exposing (..)

-- import Html exposing (..)

import Browser
import Browser.Navigation as Nav
import Css exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Url
import Url.Builder as UrlBuilder



-- MAIN


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        }



-- MODEL


type CandidateList
    = Loading
    | NoInput
    | Success (List Candidate)
    | Failure String


type alias Candidate =
    { word : String
    , lettersMatched : Int
    , score : Int
    , definition : String
    }


type alias Model =
    { key : Nav.Key
    , url : Url.Url
    , input : String
    , candidates : CandidateList
    }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( Model key url "" NoInput, Cmd.none )



-- UPDATE


type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | InputChanged String
    | GotCandidates (Result Http.Error (List Candidate))


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        UrlChanged url ->
            ( { model | url = url }
            , Cmd.none
            )

        InputChanged newInput ->
            if newInput == "" then
                ( { model | input = "", candidates = NoInput }
                , Cmd.none
                )

            else
                ( { model | input = newInput, candidates = Loading }
                , getSolutionCandidates newInput
                )

        GotCandidates result ->
            case result of
                Ok candidates ->
                    ( { model | candidates = Success candidates }
                    , Cmd.none
                    )

                Err err ->
                    ( { model | candidates = Failure (formatError err) }
                    , Cmd.none
                    )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- VIEW


view : Model -> Browser.Document Msg
view model =
    { title = "Scrabble Solver"
    , body =
        [ div [ class "container" ]
            [ h2 [] [ text "Anyone for Scrabble?" ]
            , div [ class "row" ]
                [ input [ type_ "text", placeholder "Letters", value model.input, onInput InputChanged ] []
                ]
            , div [ class "row" ] [ viewCandidateList model.candidates ]
            ]
        ]
    }


formatError : Http.Error -> String
formatError err =
    case err of
        Http.BadUrl u ->
            "Dunno how to deal with: " ++ u

        Http.BadStatus i ->
            "Uh-oh -- the server said: " ++ String.fromInt i

        Http.BadBody s ->
            "OK, I got something I wasn't expecting: " ++ s

        Http.Timeout ->
            "Timed out?"

        Http.NetworkError ->
            "Yeah something funky's going on"


viewCandidateList : CandidateList -> Html Msg
viewCandidateList candidateList =
    case candidateList of
        NoInput ->
            p [ style "color" "orange" ] [ text "Nothing to see, yet..." ]

        Loading ->
            -- TODO: style this nicely, make it a spinner, something
            p [ style "color" "blue" ] [ text "Loading... Loading..." ]

        Failure reason ->
            -- TODO: style this nicely, make it an alert box, something
            p [ style "color" "red" ] [ text reason ]

        Success candidates ->
            ol [ style "list-style-type" "none" ] (List.map viewCandidate candidates)



-- TODO: use elm-css to make this pretty, without spending eons on
-- having the types match up


viewCandidate : Candidate -> Html Msg
viewCandidate c =
    li [ style "padding" "4px"]
        [ span [ style "display" "inline-block" ] [ text c.word ]
        , span [ style "display" "inline-block", style "padding" "4px", style "font-weight" "bold" ] [ text (String.fromInt c.score) ]
        , span [ style "display" "inline-block", style "padding" "4px", style "font-style" "italic" ] [ text (String.fromInt c.lettersMatched) ]
        , span [ style "display" "block", style "font-size" "small", style "color" "#444" ] [ text c.definition ]
        ]



-- Business Logic Functions


getSolutionCandidates : String -> Cmd Msg
getSolutionCandidates input =
    Http.get
        -- TODO: expose these as options in the UI
        { url =
            UrlBuilder.absolute [ "solve" ]
                [ UrlBuilder.string "letters" input
                , UrlBuilder.int "limit" 50
                , UrlBuilder.string "sort_by" "match_count_desc"
                , UrlBuilder.int "min_match" 3
                ]
        , expect = Http.expectJson GotCandidates candidateListDecoder
        }


candidateListDecoder : D.Decoder (List Candidate)
candidateListDecoder =
    D.field "data" (D.list candidateDecoder)


candidateDecoder : D.Decoder Candidate
candidateDecoder =
    D.map4 Candidate
        (D.field "word" D.string)
        (D.field "lettersMatched" D.int)
        (D.field "score" D.int)
        (D.field "definition" D.string)
