module ApplicationHelper

  def collapse_organisation(nav_id, set_id)
    controller = params[:controller]
    'collapse' unless nav_id == set_id
  end
  def collapse_meeting(nav_id, set_id, controller_array)
    controller = params[:controller]
    'collapse' unless nav_id == set_id and controller_array.include?(controller) 
  end

  def active(nav_id, set_id)
    'active' if nav_id == set_id
  end
  
def meeting_component_active(nav_id, set_id, controllers, actions)

  
  'active' if (nav_id == set_id and controllers.include?(params[:controller]) and actions.include?(params[:action]))

end


end
