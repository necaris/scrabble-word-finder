open Web

(* Bindings to externals, DOM *)
type document
external getElementById :
  document -> string -> Web.Node.t Js.nullable = "getElementById"
[@@bs.send]

external doc : document = "document"
[@@bs.val]

let default = Window.setTimeout (fun () ->
    (Main.main (getElementById doc "app") ()) |> ignore;
  ()) 1.0
