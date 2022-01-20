module ApplicationHelper

  def collapse_organisation(nav_id, set_id)
    controller = params[:controller]
    'collapse' unless nav_id == set_id
  end
  def collapse_meeting(nav_id, set_id)
    controller = params[:controller]
    'collapse' unless nav_id == set_id and controller == 'meetings'
  end

  def active(nav_id, set_id)
    'active' if nav_id == set_id
  end
  
end
